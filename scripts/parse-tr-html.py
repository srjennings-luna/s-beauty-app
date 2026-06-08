#!/usr/bin/env python3
"""
Parse Cowork's CONTUERI-PP-TraditionReflections-30Day.html into a JSON file
the seed script can consume. One record per day. Body text preserved verbatim.
"""

import json
import re
from html.parser import HTMLParser
from pathlib import Path

SRC = Path.home() / "Documents" / "CONTUERI-PP-TraditionReflections-30Day.html"
OUT = Path("/tmp/tr-extracted.json")


def text_of(node):
    """Recursively join text content from a mini-DOM dict."""
    if node is None:
        return ""
    if node.get("text") is not None:
        return node["text"]
    return "".join(text_of(c) for c in node.get("children", []))


class DOMBuilder(HTMLParser):
    """Minimal DOM tree so we can walk by class name."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = {"tag": "ROOT", "attrs": {}, "children": [], "text": None}
        self.stack = [self.root]
        # void elements that never get a close tag in HTML5
        self.void = {"br", "hr", "img", "meta", "link", "input"}

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "children": [], "text": None}
        self.stack[-1]["children"].append(node)
        if tag not in self.void:
            self.stack.append(node)

    def handle_endtag(self, tag):
        # close to the most recent matching tag (lenient)
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i]["tag"] == tag:
                self.stack = self.stack[: i]
                return

    def handle_data(self, data):
        if not data:
            return
        node = {"tag": "#text", "attrs": {}, "children": [], "text": data}
        self.stack[-1]["children"].append(node)


def find_all(node, predicate):
    out = []
    if predicate(node):
        out.append(node)
    for c in node.get("children", []):
        out.extend(find_all(c, predicate))
    return out


def find_first(node, predicate):
    if predicate(node):
        return node
    for c in node.get("children", []):
        r = find_first(c, predicate)
        if r is not None:
            return r
    return None


def has_class(node, cls):
    classes = (node.get("attrs", {}) or {}).get("class", "")
    return cls in classes.split()


def clean(s):
    if s is None:
        return ""
    # collapse internal whitespace, strip ends
    return re.sub(r"\s+", " ", s).strip()


def paragraphs_of(node):
    """Return a list of paragraph text strings from a node's <p> children."""
    ps = find_all(node, lambda n: n.get("tag") == "p")
    return [clean(text_of(p)) for p in ps if clean(text_of(p))]


def extract_sanity_field(block, label):
    """tr-sanity contains divs with .sanity-label / .sanity-val pairs."""
    field_nodes = find_all(block, lambda n: has_class(n, "sanity-field"))
    for fn in field_nodes:
        lbl_node = find_first(fn, lambda n: has_class(n, "sanity-label"))
        val_node = find_first(fn, lambda n: has_class(n, "sanity-val"))
        if lbl_node and clean(text_of(lbl_node)).lower() == label.lower():
            return clean(text_of(val_node)) if val_node else ""
    return ""


def extract_source_url(block):
    """Source URL lives inside <a href="..."> in the sanity-val."""
    field_nodes = find_all(block, lambda n: has_class(n, "sanity-field"))
    for fn in field_nodes:
        lbl_node = find_first(fn, lambda n: has_class(n, "sanity-label"))
        if lbl_node and clean(text_of(lbl_node)).lower() == "source url":
            a = find_first(fn, lambda n: n.get("tag") == "a")
            if a:
                return (a.get("attrs", {}) or {}).get("href", "")
    return ""


def main():
    html = SRC.read_text(encoding="utf-8")
    parser = DOMBuilder()
    parser.feed(html)
    dom = parser.root

    blocks = find_all(dom, lambda n: has_class(n, "tr-block"))
    records = []
    em_dash_count = 0

    for block in blocks:
        day_val_node = find_first(block, lambda n: has_class(n, "tr-day-val"))
        day_number = int(clean(text_of(day_val_node))) if day_val_node else None

        content_title_node = find_first(block, lambda n: has_class(n, "tr-content-title"))
        content_title = clean(text_of(content_title_node))

        author_name_node = find_first(block, lambda n: has_class(n, "tr-author-name"))
        author_name = clean(text_of(author_name_node))

        source_work_node = find_first(block, lambda n: has_class(n, "tr-source-work"))
        source_work = clean(text_of(source_work_node))

        # Short quote — inside blockquote inside tr-pull-quote
        pq_node = find_first(block, lambda n: has_class(n, "tr-pull-quote"))
        short_quote = ""
        short_quote_attribution = ""
        if pq_node:
            bq = find_first(pq_node, lambda n: n.get("tag") == "blockquote")
            if bq:
                short_quote = clean(text_of(bq))
                # strip surrounding curly/straight double quotes
                short_quote = re.sub(r'^["“”]+|["“”]+$', "", short_quote).strip()
            attr_node = find_first(pq_node, lambda n: has_class(n, "tr-pull-attribution"))
            if attr_node:
                short_quote_attribution = clean(text_of(attr_node))

        body_node = find_first(block, lambda n: has_class(n, "tr-body"))
        body_paragraphs = paragraphs_of(body_node) if body_node else []
        body = "\n\n".join(body_paragraphs)

        sanity_block = find_first(block, lambda n: has_class(n, "tr-sanity"))
        slug = extract_sanity_field(sanity_block, "Slug")
        author_type = extract_sanity_field(sanity_block, "Author Type")
        era = extract_sanity_field(sanity_block, "Era")
        source_url = extract_source_url(sanity_block) if sanity_block else ""

        em_dash_count += body.count("—") + short_quote.count("—")

        records.append({
            "dayNumber": day_number,
            "contentTitle": content_title,
            "trSlug": slug,
            "authorName": author_name,
            "sourceWork": source_work,
            "authorType": author_type,
            "era": era,
            "shortQuote": short_quote,
            "shortQuoteAttribution": short_quote_attribution,
            "body": body,
            "sourceUrl": source_url,
        })

    OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(records)} TR records to {OUT}")
    print(f"Em dashes in TR body/quote text: {em_dash_count}")
    missing_slug = [r["dayNumber"] for r in records if not r["trSlug"]]
    if missing_slug:
        print(f"⚠ Days missing trSlug: {missing_slug}")
    missing_body = [r["dayNumber"] for r in records if not r["body"]]
    if missing_body:
        print(f"⚠ Days missing body: {missing_body}")


if __name__ == "__main__":
    main()
