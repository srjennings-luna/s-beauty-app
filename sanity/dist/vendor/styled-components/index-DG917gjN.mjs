import C, { createElement as er } from "react";
var _ = function() {
  return _ = Object.assign || function(t) {
    for (var r, n = 1, s = arguments.length; n < s; n++) {
      r = arguments[n];
      for (var o in r) Object.prototype.hasOwnProperty.call(r, o) && (t[o] = r[o]);
    }
    return t;
  }, _.apply(this, arguments);
};
function oe(e, t, r) {
  if (r || arguments.length === 2) for (var n = 0, s = t.length, o; n < s; n++)
    (o || !(n in t)) && (o || (o = Array.prototype.slice.call(t, 0, n)), o[n] = t[n]);
  return e.concat(o || Array.prototype.slice.call(t));
}
var P = "-ms-", ge = "-moz-", v = "-webkit-", Rt = "comm", Te = "rule", tt = "decl", tr = "@import", rr = "@namespace", Nt = "@keyframes", nr = "@layer", kt = Math.abs, rt = String.fromCharCode, Ke = Object.assign;
function sr(e, t) {
  return k(e, 0) ^ 45 ? (((t << 2 ^ k(e, 0)) << 2 ^ k(e, 1)) << 2 ^ k(e, 2)) << 2 ^ k(e, 3) : 0;
}
function Ot(e) {
  return e.trim();
}
function W(e, t) {
  return (e = t.exec(e)) ? e[0] : e;
}
function p(e, t, r) {
  return e.replace(t, r);
}
function Ie(e, t, r) {
  return e.indexOf(t, r);
}
function k(e, t) {
  return e.charCodeAt(t) | 0;
}
function Z(e, t, r) {
  return e.slice(t, r);
}
function F(e) {
  return e.length;
}
function $t(e) {
  return e.length;
}
function de(e, t) {
  return t.push(e), e;
}
function or(e, t) {
  return e.map(t).join("");
}
function gt(e, t) {
  return e.filter(function(r) {
    return !W(r, t);
  });
}
var je = 1, ie = 1, Tt = 0, D = 0, R = 0, fe = "";
function De(e, t, r, n, s, o, i, u) {
  return { value: e, root: t, parent: r, type: n, props: s, children: o, line: je, column: ie, length: i, return: "", siblings: u };
}
function q(e, t) {
  return Ke(De("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, t);
}
function te(e) {
  for (; e.root; )
    e = q(e.root, { children: [e] });
  de(e, e.siblings);
}
function ir() {
  return R;
}
function ar() {
  return R = D > 0 ? k(fe, --D) : 0, ie--, R === 10 && (ie = 1, je--), R;
}
function G() {
  return R = D < Tt ? k(fe, D++) : 0, ie++, R === 10 && (ie = 1, je++), R;
}
function H() {
  return k(fe, D);
}
function xe() {
  return D;
}
function Me(e, t) {
  return Z(fe, e, t);
}
function me(e) {
  switch (e) {
    // \0 \t \n \r \s whitespace token
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    // ! + , / > @ ~ isolate token
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    // ; { } breakpoint token
    case 59:
    case 123:
    case 125:
      return 4;
    // : accompanied token
    case 58:
      return 3;
    // " ' ( [ opening delimit token
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    // ) ] closing delimit token
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function cr(e) {
  return je = ie = 1, Tt = F(fe = e), D = 0, [];
}
function ur(e) {
  return fe = "", e;
}
function We(e) {
  return Ot(Me(D - 1, Ue(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function fr(e) {
  for (; (R = H()) && R < 33; )
    G();
  return me(e) > 2 || me(R) > 3 ? "" : " ";
}
function lr(e, t) {
  for (; --t && G() && !(R < 48 || R > 102 || R > 57 && R < 65 || R > 70 && R < 97); )
    ;
  return Me(e, xe() + (t < 6 && H() == 32 && G() == 32));
}
function Ue(e) {
  for (; G(); )
    switch (R) {
      // ] ) " '
      case e:
        return D;
      // " '
      case 34:
      case 39:
        e !== 34 && e !== 39 && Ue(R);
        break;
      // (
      case 40:
        e === 41 && Ue(e);
        break;
      // \
      case 92:
        G();
        break;
    }
  return D;
}
function pr(e, t) {
  for (; G() && e + R !== 57; )
    if (e + R === 84 && H() === 47)
      break;
  return "/*" + Me(t, D - 1) + "*" + rt(e === 47 ? e : G());
}
function hr(e) {
  for (; !me(H()); )
    G();
  return Me(e, D);
}
function dr(e) {
  return ur(Pe("", null, null, null, [""], e = cr(e), 0, [0], e));
}
function Pe(e, t, r, n, s, o, i, u, f) {
  for (var h = 0, m = 0, d = i, S = 0, y = 0, b = 0, I = 1, O = 1, E = 1, x = 0, c = "", g = s, w = o, l = n, a = c; O; )
    switch (b = x, x = G()) {
      // (
      case 40:
        if (b != 108 && k(a, d - 1) == 58) {
          Ie(a += p(We(x), "&", "&\f"), "&\f", kt(h ? u[h - 1] : 0)) != -1 && (E = -1);
          break;
        }
      // " ' [
      case 34:
      case 39:
      case 91:
        a += We(x);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        a += fr(b);
        break;
      // \
      case 92:
        a += lr(xe() - 1, 7);
        continue;
      // /
      case 47:
        switch (H()) {
          case 42:
          case 47:
            de(gr(pr(G(), xe()), t, r, f), f), (me(b || 1) == 5 || me(H() || 1) == 5) && F(a) && Z(a, -1, void 0) !== " " && (a += " ");
            break;
          default:
            a += "/";
        }
        break;
      // {
      case 123 * I:
        u[h++] = F(a) * E;
      // } ; \0
      case 125 * I:
      case 59:
      case 0:
        switch (x) {
          // \0 }
          case 0:
          case 125:
            O = 0;
          // ;
          case 59 + m:
            E == -1 && (a = p(a, /\f/g, "")), y > 0 && (F(a) - d || I === 0 && b === 47) && de(y > 32 ? yt(a + ";", n, r, d - 1, f) : yt(p(a, " ", "") + ";", n, r, d - 2, f), f);
            break;
          // @ ;
          case 59:
            a += ";";
          // { rule/at-rule
          default:
            if (de(l = mt(a, t, r, h, m, s, u, c, g = [], w = [], d, o), o), x === 123)
              if (m === 0)
                Pe(a, t, l, l, g, o, d, u, w);
              else {
                switch (S) {
                  // c(ontainer)
                  case 99:
                    if (k(a, 3) === 110) break;
                  // l(ayer)
                  case 108:
                    if (k(a, 2) === 97) break;
                  default:
                    m = 0;
                  // d(ocument) m(edia) s(upports)
                  case 100:
                  case 109:
                  case 115:
                }
                m ? Pe(e, l, l, n && de(mt(e, l, l, 0, 0, s, u, c, s, g = [], d, w), w), s, w, d, u, n ? g : w) : Pe(a, l, l, l, [""], w, 0, u, w);
              }
        }
        h = m = y = 0, I = E = 1, c = a = "", d = i;
        break;
      // :
      case 58:
        d = 1 + F(a), y = b;
      default:
        if (I < 1) {
          if (x == 123)
            --I;
          else if (x == 125 && I++ == 0 && ar() == 125)
            continue;
        }
        switch (a += rt(x), x * I) {
          // &
          case 38:
            E = m > 0 ? 1 : (a += "\f", -1);
            break;
          // ,
          case 44:
            u[h++] = (F(a) - 1) * E, E = 1;
            break;
          // @
          case 64:
            H() === 45 && (a += We(G())), S = H(), m = d = F(c = a += hr(xe())), x++;
            break;
          // -
          case 45:
            b === 45 && F(a) == 2 && (I = 0);
        }
    }
  return o;
}
function mt(e, t, r, n, s, o, i, u, f, h, m, d) {
  for (var S = s - 1, y = s === 0 ? o : [""], b = $t(y), I = 0, O = 0, E = 0; I < n; ++I)
    for (var x = 0, c = Z(e, S + 1, S = kt(O = i[I])), g = e; x < b; ++x)
      (g = Ot(O > 0 ? y[x] + " " + c : p(c, /&\f/g, y[x]))) && (f[E++] = g);
  return De(e, t, r, s === 0 ? Te : u, f, h, m, d);
}
function gr(e, t, r, n) {
  return De(e, t, r, Rt, rt(ir()), Z(e, 2, -2), 0, n);
}
function yt(e, t, r, n, s) {
  return De(e, t, r, tt, Z(e, 0, n), Z(e, n + 1, -1), n, s);
}
function jt(e, t, r) {
  switch (sr(e, t)) {
    // color-adjust
    case 5103:
      return v + "print-" + e + e;
    // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
    // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
      return v + e + e;
    // mask-composite
    case 4855:
      return v + e.replace("add", "source-over").replace("substract", "source-out").replace("intersect", "source-in").replace("exclude", "xor") + e;
    // tab-size
    case 4789:
      return ge + e + e;
    // appearance, user-select, transform, hyphens, text-size-adjust
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return v + e + ge + e + P + e + e;
    // writing-mode
    case 5936:
      switch (k(e, t + 11)) {
        // vertical-l(r)
        case 114:
          return v + e + P + p(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        // vertical-r(l)
        case 108:
          return v + e + P + p(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        // horizontal(-)tb
        case 45:
          return v + e + P + p(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
    // flex, flex-direction, scroll-snap-type, writing-mode
    case 6828:
    case 4268:
    case 2903:
      return v + e + P + e + e;
    // order
    case 6165:
      return v + e + P + "flex-" + e + e;
    // align-items
    case 5187:
      return v + e + p(e, /(\w+).+(:[^]+)/, v + "box-$1$2" + P + "flex-$1$2") + e;
    // align-self
    case 5443:
      return v + e + P + "flex-item-" + p(e, /flex-|-self/g, "") + (W(e, /flex-|baseline/) ? "" : P + "grid-row-" + p(e, /flex-|-self/g, "")) + e;
    // align-content
    case 4675:
      return v + e + P + "flex-line-pack" + p(e, /align-content|flex-|-self/g, "") + e;
    // flex-shrink
    case 5548:
      return v + e + P + p(e, "shrink", "negative") + e;
    // flex-basis
    case 5292:
      return v + e + P + p(e, "basis", "preferred-size") + e;
    // flex-grow
    case 6060:
      return v + "box-" + p(e, "-grow", "") + v + e + P + p(e, "grow", "positive") + e;
    // transition
    case 4554:
      return v + p(e, /([^-])(transform)/g, "$1" + v + "$2") + e;
    // cursor
    case 6187:
      return p(p(p(e, /(zoom-|grab)/, v + "$1"), /(image-set)/, v + "$1"), e, "") + e;
    // background, background-image
    case 5495:
    case 3959:
      return p(e, /(image-set\([^]*)/, v + "$1$`$1");
    // justify-content
    case 4968:
      return p(p(e, /(.+:)(flex-)?(.*)/, v + "box-pack:$3" + P + "flex-pack:$3"), /space-between/, "justify") + v + e + e;
    // justify-self
    case 4200:
      if (!W(e, /flex-|baseline/)) return P + "grid-column-align" + Z(e, t) + e;
      break;
    // grid-template-(columns|rows)
    case 2592:
    case 3360:
      return P + p(e, "template-", "") + e;
    // grid-(row|column)-start
    case 4384:
    case 3616:
      return r && r.some(function(n, s) {
        return t = s, W(n.props, /grid-\w+-end/);
      }) ? ~Ie(e + (r = r[t].value), "span", 0) ? e : P + p(e, "-start", "") + e + P + "grid-row-span:" + (~Ie(r, "span", 0) ? W(r, /\d+/) : +W(r, /\d+/) - +W(e, /\d+/)) + ";" : P + p(e, "-start", "") + e;
    // grid-(row|column)-end
    case 4896:
    case 4128:
      return r && r.some(function(n) {
        return W(n.props, /grid-\w+-start/);
      }) ? e : P + p(p(e, "-end", "-span"), "span ", "") + e;
    // (margin|padding)-inline-(start|end)
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return p(e, /(.+)-inline(.+)/, v + "$1$2") + e;
    // (min|max)?(width|height|inline-size|block-size)
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (F(e) - 1 - t > 6)
        switch (k(e, t + 1)) {
          // (m)ax-content, (m)in-content
          case 109:
            if (k(e, t + 4) !== 45)
              break;
          // (f)ill-available, (f)it-content
          case 102:
            return p(e, /(.+:)(.+)-([^]+)/, "$1" + v + "$2-$3$1" + ge + (k(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
          // (s)tretch
          case 115:
            return ~Ie(e, "stretch", 0) ? jt(p(e, "stretch", "fill-available"), t, r) + e : e;
        }
      break;
    // grid-(column|row)
    case 5152:
    case 5920:
      return p(e, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(n, s, o, i, u, f, h) {
        return P + s + ":" + o + h + (i ? P + s + "-span:" + (u ? f : +f - +o) + h : "") + e;
      });
    // position: sticky
    case 4949:
      if (k(e, t + 6) === 121)
        return p(e, ":", ":" + v) + e;
      break;
    // display: (flex|inline-flex|grid|inline-grid)
    case 6444:
      switch (k(e, k(e, 14) === 45 ? 18 : 11)) {
        // (inline-)?fle(x)
        case 120:
          return p(e, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + v + (k(e, 14) === 45 ? "inline-" : "") + "box$3$1" + v + "$2$3$1" + P + "$2box$3") + e;
        // (inline-)?gri(d)
        case 100:
          return p(e, ":", ":" + P) + e;
      }
      break;
    // scroll-margin, scroll-margin-(top|right|bottom|left)
    case 5719:
    case 2647:
    case 2135:
    case 3927:
    case 2391:
      return p(e, "scroll-", "scroll-snap-") + e;
  }
  return e;
}
function Re(e, t) {
  for (var r = "", n = 0; n < e.length; n++)
    r += t(e[n], n, e, t) || "";
  return r;
}
function mr(e, t, r, n) {
  switch (e.type) {
    case nr:
      if (e.children.length) break;
    case tr:
    case rr:
    case tt:
      return e.return = e.return || e.value;
    case Rt:
      return "";
    case Nt:
      return e.return = e.value + "{" + Re(e.children, n) + "}";
    case Te:
      if (!F(e.value = e.props.join(","))) return "";
  }
  return F(r = Re(e.children, n)) ? e.return = e.value + "{" + r + "}" : "";
}
function yr(e) {
  var t = $t(e);
  return function(r, n, s, o) {
    for (var i = "", u = 0; u < t; u++)
      i += e[u](r, n, s, o) || "";
    return i;
  };
}
function vr(e) {
  return function(t) {
    t.root || (t = t.return) && e(t);
  };
}
function Sr(e, t, r, n) {
  if (e.length > -1 && !e.return)
    switch (e.type) {
      case tt:
        e.return = jt(e.value, e.length, r);
        return;
      case Nt:
        return Re([q(e, { value: p(e.value, "@", "@" + v) })], n);
      case Te:
        if (e.length)
          return or(r = e.props, function(s) {
            switch (W(s, n = /(::plac\w+|:read-\w+)/)) {
              // :read-(only|write)
              case ":read-only":
              case ":read-write":
                te(q(e, { props: [p(s, /:(read-\w+)/, ":" + ge + "$1")] })), te(q(e, { props: [s] })), Ke(e, { props: gt(r, n) });
                break;
              // :placeholder
              case "::placeholder":
                te(q(e, { props: [p(s, /:(plac\w+)/, ":" + v + "input-$1")] })), te(q(e, { props: [p(s, /:(plac\w+)/, ":" + ge + "$1")] })), te(q(e, { props: [p(s, /:(plac\w+)/, P + "input-$1")] })), te(q(e, { props: [s] })), Ke(e, { props: gt(r, n) });
                break;
            }
            return "";
          });
    }
}
var br = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
}, U = typeof process < "u" && process.env !== void 0 && (process.env.REACT_APP_SC_ATTR || process.env.SC_ATTR) || "data-styled", Dt = "active", Ne = "data-styled-version", ae = "6.3.8", nt = `/*!sc*/
`, ke = typeof window < "u" && typeof document < "u", T = C.createContext === void 0, wr = !!(typeof SC_DISABLE_SPEEDY == "boolean" ? SC_DISABLE_SPEEDY : typeof process < "u" && process.env !== void 0 && process.env.REACT_APP_SC_DISABLE_SPEEDY !== void 0 && process.env.REACT_APP_SC_DISABLE_SPEEDY !== "" ? process.env.REACT_APP_SC_DISABLE_SPEEDY !== "false" && process.env.REACT_APP_SC_DISABLE_SPEEDY : typeof process < "u" && process.env !== void 0 && process.env.SC_DISABLE_SPEEDY !== void 0 && process.env.SC_DISABLE_SPEEDY !== "" && process.env.SC_DISABLE_SPEEDY !== "false" && process.env.SC_DISABLE_SPEEDY), Cr = {}, Fe = Object.freeze([]), ce = Object.freeze({});
function st(e, t, r) {
  return r === void 0 && (r = ce), e.theme !== r.theme && e.theme || t || r.theme;
}
var Mt = /* @__PURE__ */ new Set(["a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "body", "button", "br", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meter", "nav", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tspan", "use"]), Ar = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g, Ir = /(^-|-$)/g;
function vt(e) {
  return e.replace(Ar, "-").replace(Ir, "");
}
var xr = /(a)(d)/gi, St = function(e) {
  return String.fromCharCode(e + (e > 25 ? 39 : 97));
};
function Ve(e) {
  var t, r = "";
  for (t = Math.abs(e); t > 52; t = t / 52 | 0) r = St(t % 52) + r;
  return (St(t % 52) + r).replace(xr, "$1-$2");
}
var Ye, re = function(e, t) {
  for (var r = t.length; r; ) e = 33 * e ^ t.charCodeAt(--r);
  return e;
}, Ft = function(e) {
  return re(5381, e);
};
function ot(e) {
  return Ve(Ft(e) >>> 0);
}
function Gt(e) {
  return e.displayName || e.name || "Component";
}
function qe(e) {
  return typeof e == "string" && !0;
}
var zt = typeof Symbol == "function" && Symbol.for, Lt = zt ? Symbol.for("react.memo") : 60115, Pr = zt ? Symbol.for("react.forward_ref") : 60112, Er = { childContextTypes: !0, contextType: !0, contextTypes: !0, defaultProps: !0, displayName: !0, getDefaultProps: !0, getDerivedStateFromError: !0, getDerivedStateFromProps: !0, mixins: !0, propTypes: !0, type: !0 }, _r = { name: !0, length: !0, prototype: !0, caller: !0, callee: !0, arguments: !0, arity: !0 }, Bt = { $$typeof: !0, compare: !0, defaultProps: !0, displayName: !0, propTypes: !0, type: !0 }, Rr = ((Ye = {})[Pr] = { $$typeof: !0, render: !0, defaultProps: !0, displayName: !0, propTypes: !0 }, Ye[Lt] = Bt, Ye);
function bt(e) {
  return ("type" in (t = e) && t.type.$$typeof) === Lt ? Bt : "$$typeof" in e ? Rr[e.$$typeof] : Er;
  var t;
}
var Nr = Object.defineProperty, kr = Object.getOwnPropertyNames, wt = Object.getOwnPropertySymbols, Or = Object.getOwnPropertyDescriptor, $r = Object.getPrototypeOf, Ct = Object.prototype;
function it(e, t, r) {
  if (typeof t != "string") {
    if (Ct) {
      var n = $r(t);
      n && n !== Ct && it(e, n, r);
    }
    var s = kr(t);
    wt && (s = s.concat(wt(t)));
    for (var o = bt(e), i = bt(t), u = 0; u < s.length; ++u) {
      var f = s[u];
      if (!(f in _r || r && r[f] || i && f in i || o && f in o)) {
        var h = Or(t, f);
        try {
          Nr(e, f, h);
        } catch {
        }
      }
    }
  }
  return e;
}
function J(e) {
  return typeof e == "function";
}
function at(e) {
  return typeof e == "object" && "styledComponentId" in e;
}
function V(e, t) {
  return e && t ? "".concat(e, " ").concat(t) : e || t || "";
}
function ye(e, t) {
  if (e.length === 0) return "";
  for (var r = e[0], n = 1; n < e.length; n++) r += t ? t + e[n] : e[n];
  return r;
}
function ve(e) {
  return e !== null && typeof e == "object" && e.constructor.name === Object.name && !("props" in e && e.$$typeof);
}
function Ze(e, t, r) {
  if (r === void 0 && (r = !1), !r && !ve(e) && !Array.isArray(e)) return t;
  if (Array.isArray(t)) for (var n = 0; n < t.length; n++) e[n] = Ze(e[n], t[n]);
  else if (ve(t)) for (var n in t) e[n] = Ze(e[n], t[n]);
  return e;
}
function ct(e, t) {
  Object.defineProperty(e, "toString", { value: t });
}
function j(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  return new Error("An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#".concat(e, " for more information.").concat(t.length > 0 ? " Args: ".concat(t.join(", ")) : ""));
}
var Tr = (function() {
  function e(t) {
    this.groupSizes = new Uint32Array(512), this.length = 512, this.tag = t;
  }
  return e.prototype.indexOfGroup = function(t) {
    for (var r = 0, n = 0; n < t; n++) r += this.groupSizes[n];
    return r;
  }, e.prototype.insertRules = function(t, r) {
    if (t >= this.groupSizes.length) {
      for (var n = this.groupSizes, s = n.length, o = s; t >= o; ) if ((o <<= 1) < 0) throw j(16, "".concat(t));
      this.groupSizes = new Uint32Array(o), this.groupSizes.set(n), this.length = o;
      for (var i = s; i < o; i++) this.groupSizes[i] = 0;
    }
    for (var u = this.indexOfGroup(t + 1), f = (i = 0, r.length); i < f; i++) this.tag.insertRule(u, r[i]) && (this.groupSizes[t]++, u++);
  }, e.prototype.clearGroup = function(t) {
    if (t < this.length) {
      var r = this.groupSizes[t], n = this.indexOfGroup(t), s = n + r;
      this.groupSizes[t] = 0;
      for (var o = n; o < s; o++) this.tag.deleteRule(n);
    }
  }, e.prototype.getGroup = function(t) {
    var r = "";
    if (t >= this.length || this.groupSizes[t] === 0) return r;
    for (var n = this.groupSizes[t], s = this.indexOfGroup(t), o = s + n, i = s; i < o; i++) r += "".concat(this.tag.getRule(i)).concat(nt);
    return r;
  }, e;
})(), Ee = /* @__PURE__ */ new Map(), Oe = /* @__PURE__ */ new Map(), _e = 1, ne = function(e) {
  if (Ee.has(e)) return Ee.get(e);
  for (; Oe.has(_e); ) _e++;
  var t = _e++;
  return Ee.set(e, t), Oe.set(t, e), t;
}, jr = function(e, t) {
  _e = t + 1, Ee.set(e, t), Oe.set(t, e);
}, Dr = "style[".concat(U, "][").concat(Ne, '="').concat(ae, '"]'), Mr = new RegExp("^".concat(U, '\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')), Fr = function(e, t, r) {
  for (var n, s = r.split(","), o = 0, i = s.length; o < i; o++) (n = s[o]) && e.registerName(t, n);
}, Gr = function(e, t) {
  for (var r, n = ((r = t.textContent) !== null && r !== void 0 ? r : "").split(nt), s = [], o = 0, i = n.length; o < i; o++) {
    var u = n[o].trim();
    if (u) {
      var f = u.match(Mr);
      if (f) {
        var h = 0 | parseInt(f[1], 10), m = f[2];
        h !== 0 && (jr(m, h), Fr(e, m, f[3]), e.getTag().insertRules(h, s)), s.length = 0;
      } else s.push(u);
    }
  }
}, At = function(e) {
  for (var t = document.querySelectorAll(Dr), r = 0, n = t.length; r < n; r++) {
    var s = t[r];
    s && s.getAttribute(U) !== Dt && (Gr(e, s), s.parentNode && s.parentNode.removeChild(s));
  }
};
function Je() {
  return typeof __webpack_nonce__ < "u" ? __webpack_nonce__ : null;
}
var Wt = function(e) {
  var t = document.head, r = e || t, n = document.createElement("style"), s = (function(u) {
    var f = Array.from(u.querySelectorAll("style[".concat(U, "]")));
    return f[f.length - 1];
  })(r), o = s !== void 0 ? s.nextSibling : null;
  n.setAttribute(U, Dt), n.setAttribute(Ne, ae);
  var i = Je();
  return i && n.setAttribute("nonce", i), r.insertBefore(n, o), n;
}, zr = (function() {
  function e(t) {
    this.element = Wt(t), this.element.appendChild(document.createTextNode("")), this.sheet = (function(r) {
      if (r.sheet) return r.sheet;
      for (var n = document.styleSheets, s = 0, o = n.length; s < o; s++) {
        var i = n[s];
        if (i.ownerNode === r) return i;
      }
      throw j(17);
    })(this.element), this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    try {
      return this.sheet.insertRule(r, t), this.length++, !0;
    } catch {
      return !1;
    }
  }, e.prototype.deleteRule = function(t) {
    this.sheet.deleteRule(t), this.length--;
  }, e.prototype.getRule = function(t) {
    var r = this.sheet.cssRules[t];
    return r && r.cssText ? r.cssText : "";
  }, e;
})(), Lr = (function() {
  function e(t) {
    this.element = Wt(t), this.nodes = this.element.childNodes, this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    if (t <= this.length && t >= 0) {
      var n = document.createTextNode(r);
      return this.element.insertBefore(n, this.nodes[t] || null), this.length++, !0;
    }
    return !1;
  }, e.prototype.deleteRule = function(t) {
    this.element.removeChild(this.nodes[t]), this.length--;
  }, e.prototype.getRule = function(t) {
    return t < this.length ? this.nodes[t].textContent : "";
  }, e;
})(), Br = (function() {
  function e(t) {
    this.rules = [], this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    return t <= this.length && (this.rules.splice(t, 0, r), this.length++, !0);
  }, e.prototype.deleteRule = function(t) {
    this.rules.splice(t, 1), this.length--;
  }, e.prototype.getRule = function(t) {
    return t < this.length ? this.rules[t] : "";
  }, e;
})(), It = ke, Wr = { isServer: !ke, useCSSOMInjection: !wr }, ue = (function() {
  function e(t, r, n) {
    t === void 0 && (t = ce), r === void 0 && (r = {});
    var s = this;
    this.options = _(_({}, Wr), t), this.gs = r, this.names = new Map(n), this.server = !!t.isServer, !this.server && ke && It && (It = !1, At(this)), ct(this, function() {
      return (function(o) {
        for (var i = o.getTag(), u = i.length, f = "", h = function(d) {
          var S = (function(E) {
            return Oe.get(E);
          })(d);
          if (S === void 0) return "continue";
          var y = o.names.get(S), b = i.getGroup(d);
          if (y === void 0 || !y.size || b.length === 0) return "continue";
          var I = "".concat(U, ".g").concat(d, '[id="').concat(S, '"]'), O = "";
          y !== void 0 && y.forEach(function(E) {
            E.length > 0 && (O += "".concat(E, ","));
          }), f += "".concat(b).concat(I, '{content:"').concat(O, '"}').concat(nt);
        }, m = 0; m < u; m++) h(m);
        return f;
      })(s);
    });
  }
  return e.registerId = function(t) {
    return ne(t);
  }, e.prototype.rehydrate = function() {
    !this.server && ke && At(this);
  }, e.prototype.reconstructWithOptions = function(t, r) {
    return r === void 0 && (r = !0), new e(_(_({}, this.options), t), this.gs, r && this.names || void 0);
  }, e.prototype.allocateGSInstance = function(t) {
    return this.gs[t] = (this.gs[t] || 0) + 1;
  }, e.prototype.getTag = function() {
    return this.tag || (this.tag = (t = (function(r) {
      var n = r.useCSSOMInjection, s = r.target;
      return r.isServer ? new Br(s) : n ? new zr(s) : new Lr(s);
    })(this.options), new Tr(t)));
    var t;
  }, e.prototype.hasNameForId = function(t, r) {
    return this.names.has(t) && this.names.get(t).has(r);
  }, e.prototype.registerName = function(t, r) {
    if (ne(t), this.names.has(t)) this.names.get(t).add(r);
    else {
      var n = /* @__PURE__ */ new Set();
      n.add(r), this.names.set(t, n);
    }
  }, e.prototype.insertRules = function(t, r, n) {
    this.registerName(t, r), this.getTag().insertRules(ne(t), n);
  }, e.prototype.clearNames = function(t) {
    this.names.has(t) && this.names.get(t).clear();
  }, e.prototype.clearRules = function(t) {
    this.getTag().clearGroup(ne(t)), this.clearNames(t);
  }, e.prototype.clearTag = function() {
    this.tag = void 0;
  }, e;
})(), Yr = /&/g, se = 47;
function xt(e) {
  if (e.indexOf("}") === -1) return !1;
  for (var t = e.length, r = 0, n = 0, s = !1, o = 0; o < t; o++) {
    var i = e.charCodeAt(o);
    if (n !== 0 || s || i !== se || e.charCodeAt(o + 1) !== 42) if (s) i === 42 && e.charCodeAt(o + 1) === se && (s = !1, o++);
    else if (i !== 34 && i !== 39 || o !== 0 && e.charCodeAt(o - 1) === 92) {
      if (n === 0) {
        if (i === 123) r++;
        else if (i === 125 && --r < 0) return !0;
      }
    } else n === 0 ? n = i : n === i && (n = 0);
    else s = !0, o++;
  }
  return r !== 0 || n !== 0;
}
function Yt(e, t) {
  return e.map(function(r) {
    return r.type === "rule" && (r.value = "".concat(t, " ").concat(r.value), r.value = r.value.replaceAll(",", ",".concat(t, " ")), r.props = r.props.map(function(n) {
      return "".concat(t, " ").concat(n);
    })), Array.isArray(r.children) && r.type !== "@keyframes" && (r.children = Yt(r.children, t)), r;
  });
}
function qt(e) {
  var t, r, n, s = e === void 0 ? ce : e, o = s.options, i = o === void 0 ? ce : o, u = s.plugins, f = u === void 0 ? Fe : u, h = function(S, y, b) {
    return b.startsWith(r) && b.endsWith(r) && b.replaceAll(r, "").length > 0 ? ".".concat(t) : S;
  }, m = f.slice();
  m.push(function(S) {
    S.type === Te && S.value.includes("&") && (S.props[0] = S.props[0].replace(Yr, r).replace(n, h));
  }), i.prefix && m.push(Sr), m.push(mr);
  var d = function(S, y, b, I) {
    y === void 0 && (y = ""), b === void 0 && (b = ""), I === void 0 && (I = "&"), t = I, r = y, n = new RegExp("\\".concat(r, "\\b"), "g");
    var O = (function(c) {
      if (!xt(c)) return c;
      for (var g = c.length, w = "", l = 0, a = 0, N = 0, $ = !1, A = 0; A < g; A++) {
        var M = c.charCodeAt(A);
        if (N !== 0 || $ || M !== se || c.charCodeAt(A + 1) !== 42) if ($) M === 42 && c.charCodeAt(A + 1) === se && ($ = !1, A++);
        else if (M !== 34 && M !== 39 || A !== 0 && c.charCodeAt(A - 1) === 92) {
          if (N === 0) if (M === 123) a++;
          else if (M === 125) {
            if (--a < 0) {
              for (var z = A + 1; z < g; ) {
                var le = c.charCodeAt(z);
                if (le === 59 || le === 10) break;
                z++;
              }
              z < g && c.charCodeAt(z) === 59 && z++, a = 0, A = z - 1, l = z;
              continue;
            }
            a === 0 && (w += c.substring(l, A + 1), l = A + 1);
          } else M === 59 && a === 0 && (w += c.substring(l, A + 1), l = A + 1);
        } else N === 0 ? N = M : N === M && (N = 0);
        else $ = !0, A++;
      }
      if (l < g) {
        var Se = c.substring(l);
        xt(Se) || (w += Se);
      }
      return w;
    })((function(c) {
      if (c.indexOf("//") === -1) return c;
      for (var g = c.length, w = [], l = 0, a = 0, N = 0, $ = 0; a < g; ) {
        var A = c.charCodeAt(a);
        if (A !== 34 && A !== 39 || a !== 0 && c.charCodeAt(a - 1) === 92) if (N === 0) if (A === 40 && a >= 3 && (32 | c.charCodeAt(a - 1)) == 108 && (32 | c.charCodeAt(a - 2)) == 114 && (32 | c.charCodeAt(a - 3)) == 117) $ = 1, a++;
        else if ($ > 0) A === 41 ? $-- : A === 40 && $++, a++;
        else if (A === se && a + 1 < g && c.charCodeAt(a + 1) === se) {
          for (a > l && w.push(c.substring(l, a)); a < g && c.charCodeAt(a) !== 10; ) a++;
          l = a;
        } else a++;
        else a++;
        else N === 0 ? N = A : N === A && (N = 0), a++;
      }
      return l === 0 ? c : (l < g && w.push(c.substring(l)), w.join(""));
    })(S)), E = dr(b || y ? "".concat(b, " ").concat(y, " { ").concat(O, " }") : O);
    i.namespace && (E = Yt(E, i.namespace));
    var x = [];
    return Re(E, yr(m.concat(vr(function(c) {
      return x.push(c);
    })))), x;
  };
  return d.hash = f.length ? f.reduce(function(S, y) {
    return y.name || j(15), re(S, y.name);
  }, 5381).toString() : "", d;
}
var Ht = new ue(), Qe = qt(), Xe = { shouldForwardProp: void 0, styleSheet: Ht, stylis: Qe }, ut = T ? { Provider: function(e) {
  return e.children;
}, Consumer: function(e) {
  return (0, e.children)(Xe);
} } : C.createContext(Xe), tn = ut.Consumer, qr = T ? { Provider: function(e) {
  return e.children;
} } : C.createContext(void 0);
function $e() {
  return T ? Xe : C.useContext(ut);
}
function Hr(e) {
  if (T || !C.useMemo) return e.children;
  var t = $e().styleSheet, r = C.useMemo(function() {
    var o = t;
    return e.sheet ? o = e.sheet : e.target && (o = o.reconstructWithOptions({ target: e.target }, !1)), e.disableCSSOMInjection && (o = o.reconstructWithOptions({ useCSSOMInjection: !1 })), o;
  }, [e.disableCSSOMInjection, e.sheet, e.target, t]), n = C.useMemo(function() {
    return qt({ options: { namespace: e.namespace, prefix: e.enableVendorPrefixes }, plugins: e.stylisPlugins });
  }, [e.enableVendorPrefixes, e.namespace, e.stylisPlugins]), s = C.useMemo(function() {
    return { shouldForwardProp: e.shouldForwardProp, styleSheet: r, stylis: n };
  }, [e.shouldForwardProp, r, n]);
  return C.createElement(ut.Provider, { value: s }, C.createElement(qr.Provider, { value: n }, e.children));
}
var Kt = (function() {
  function e(t, r) {
    var n = this;
    this.inject = function(s, o) {
      o === void 0 && (o = Qe);
      var i = n.name + o.hash;
      s.hasNameForId(n.id, i) || s.insertRules(n.id, i, o(n.rules, i, "@keyframes"));
    }, this.name = t, this.id = "sc-keyframes-".concat(t), this.rules = r, ct(this, function() {
      throw j(12, String(n.name));
    });
  }
  return e.prototype.getName = function(t) {
    return t === void 0 && (t = Qe), this.name + t.hash;
  }, e;
})();
function Kr(e, t) {
  return t == null || typeof t == "boolean" || t === "" ? "" : typeof t != "number" || t === 0 || e in br || e.startsWith("--") ? String(t).trim() : "".concat(t, "px");
}
var Ur = function(e) {
  return e >= "A" && e <= "Z";
};
function Pt(e) {
  for (var t = "", r = 0; r < e.length; r++) {
    var n = e[r];
    if (r === 1 && n === "-" && e[0] === "-") return e;
    Ur(n) ? t += "-" + n.toLowerCase() : t += n;
  }
  return t.startsWith("ms-") ? "-" + t : t;
}
var Ut = function(e) {
  return e == null || e === !1 || e === "";
}, Vt = function(e) {
  var t = [];
  for (var r in e) {
    var n = e[r];
    e.hasOwnProperty(r) && !Ut(n) && (Array.isArray(n) && n.isCss || J(n) ? t.push("".concat(Pt(r), ":"), n, ";") : ve(n) ? t.push.apply(t, oe(oe(["".concat(r, " {")], Vt(n), !1), ["}"], !1)) : t.push("".concat(Pt(r), ": ").concat(Kr(r, n), ";")));
  }
  return t;
};
function K(e, t, r, n) {
  if (Ut(e)) return [];
  if (at(e)) return [".".concat(e.styledComponentId)];
  if (J(e)) {
    if (!J(o = e) || o.prototype && o.prototype.isReactComponent || !t) return [e];
    var s = e(t);
    return K(s, t, r, n);
  }
  var o;
  return e instanceof Kt ? r ? (e.inject(r, n), [e.getName(n)]) : [e] : ve(e) ? Vt(e) : Array.isArray(e) ? Array.prototype.concat.apply(Fe, e.map(function(i) {
    return K(i, t, r, n);
  })) : [e.toString()];
}
function Zt(e) {
  for (var t = 0; t < e.length; t += 1) {
    var r = e[t];
    if (J(r) && !at(r)) return !1;
  }
  return !0;
}
var Vr = Ft(ae), Zr = (function() {
  function e(t, r, n) {
    this.rules = t, this.staticRulesId = "", this.isStatic = (n === void 0 || n.isStatic) && Zt(t), this.componentId = r, this.baseHash = re(Vr, r), this.baseStyle = n, ue.registerId(r);
  }
  return e.prototype.generateAndInjectStyles = function(t, r, n) {
    var s = this.baseStyle ? this.baseStyle.generateAndInjectStyles(t, r, n).className : "";
    if (this.isStatic && !n.hash) if (this.staticRulesId && r.hasNameForId(this.componentId, this.staticRulesId)) s = V(s, this.staticRulesId);
    else {
      var o = ye(K(this.rules, t, r, n)), i = Ve(re(this.baseHash, o) >>> 0);
      if (!r.hasNameForId(this.componentId, i)) {
        var u = n(o, ".".concat(i), void 0, this.componentId);
        r.insertRules(this.componentId, i, u);
      }
      s = V(s, i), this.staticRulesId = i;
    }
    else {
      for (var f = re(this.baseHash, n.hash), h = "", m = 0; m < this.rules.length; m++) {
        var d = this.rules[m];
        if (typeof d == "string") h += d;
        else if (d) {
          var S = ye(K(d, t, r, n));
          f = re(f, S + m), h += S;
        }
      }
      if (h) {
        var y = Ve(f >>> 0);
        if (!r.hasNameForId(this.componentId, y)) {
          var b = n(h, ".".concat(y), void 0, this.componentId);
          r.insertRules(this.componentId, y, b);
        }
        s = V(s, y);
      }
    }
    return { className: s, css: typeof window > "u" ? r.getTag().getGroup(ne(this.componentId)) : "" };
  }, e;
})(), Q = T ? { Provider: function(e) {
  return e.children;
}, Consumer: function(e) {
  return (0, e.children)(void 0);
} } : C.createContext(void 0), rn = Q.Consumer;
function nn() {
  var e = T ? void 0 : C.useContext(Q);
  if (!e) throw j(18);
  return e;
}
function sn(e) {
  if (T) return e.children;
  var t = C.useContext(Q), r = C.useMemo(function() {
    return (function(n, s) {
      if (!n) throw j(14);
      if (J(n)) {
        var o = n(s);
        return o;
      }
      if (Array.isArray(n) || typeof n != "object") throw j(8);
      return s ? _(_({}, s), n) : n;
    })(e.theme, t);
  }, [e.theme, t]);
  return e.children ? C.createElement(Q.Provider, { value: r }, e.children) : null;
}
var He = {};
function Jr(e, t, r) {
  var n = at(e), s = e, o = !qe(e), i = t.attrs, u = i === void 0 ? Fe : i, f = t.componentId, h = f === void 0 ? (function(g, w) {
    var l = typeof g != "string" ? "sc" : vt(g);
    He[l] = (He[l] || 0) + 1;
    var a = "".concat(l, "-").concat(ot(ae + l + He[l]));
    return w ? "".concat(w, "-").concat(a) : a;
  })(t.displayName, t.parentComponentId) : f, m = t.displayName, d = m === void 0 ? (function(g) {
    return qe(g) ? "styled.".concat(g) : "Styled(".concat(Gt(g), ")");
  })(e) : m, S = t.displayName && t.componentId ? "".concat(vt(t.displayName), "-").concat(t.componentId) : t.componentId || h, y = n && s.attrs ? s.attrs.concat(u).filter(Boolean) : u, b = t.shouldForwardProp;
  if (n && s.shouldForwardProp) {
    var I = s.shouldForwardProp;
    if (t.shouldForwardProp) {
      var O = t.shouldForwardProp;
      b = function(g, w) {
        return I(g, w) && O(g, w);
      };
    } else b = I;
  }
  var E = new Zr(r, S, n ? s.componentStyle : void 0);
  function x(g, w) {
    return (function(l, a, N) {
      var $ = l.attrs, A = l.componentStyle, M = l.defaultProps, z = l.foldedComponentIds, le = l.styledComponentId, Se = l.target, Qt = T ? void 0 : C.useContext(Q), Xt = $e(), Ge = l.shouldForwardProp || Xt.shouldForwardProp, lt = st(a, Qt, M) || ce, L = (function(we, X, Ce) {
        for (var he, B = _(_({}, X), { className: void 0, theme: Ce }), Be = 0; Be < we.length; Be += 1) {
          var Ae = J(he = we[Be]) ? he(B) : he;
          for (var ee in Ae) ee === "className" ? B.className = V(B.className, Ae[ee]) : ee === "style" ? B.style = _(_({}, B.style), Ae[ee]) : B[ee] = Ae[ee];
        }
        return "className" in X && typeof X.className == "string" && (B.className = V(B.className, X.className)), B;
      })($, a, lt), be = L.as || Se, pe = {};
      for (var Y in L) L[Y] === void 0 || Y[0] === "$" || Y === "as" || Y === "theme" && L.theme === lt || (Y === "forwardedAs" ? pe.as = L.forwardedAs : Ge && !Ge(Y, be) || (pe[Y] = L[Y]));
      var pt = (function(we, X) {
        var Ce = $e(), he = we.generateAndInjectStyles(X, Ce.styleSheet, Ce.stylis);
        return he;
      })(A, L), ze = pt.className, ht = pt.css, Le = V(z, le);
      ze && (Le += " " + ze), L.className && (Le += " " + L.className), pe[qe(be) && !Mt.has(be) ? "class" : "className"] = Le, N && (pe.ref = N);
      var dt = er(be, pe);
      return T && ht ? C.createElement(C.Fragment, null, C.createElement("style", { precedence: "styled-components", href: "sc-".concat(le, "-").concat(ze), children: ht }), dt) : dt;
    })(c, g, w);
  }
  x.displayName = d;
  var c = C.forwardRef(x);
  return c.attrs = y, c.componentStyle = E, c.displayName = d, c.shouldForwardProp = b, c.foldedComponentIds = n ? V(s.foldedComponentIds, s.styledComponentId) : "", c.styledComponentId = S, c.target = n ? s.target : e, Object.defineProperty(c, "defaultProps", { get: function() {
    return this._foldedDefaultProps;
  }, set: function(g) {
    this._foldedDefaultProps = n ? (function(w) {
      for (var l = [], a = 1; a < arguments.length; a++) l[a - 1] = arguments[a];
      for (var N = 0, $ = l; N < $.length; N++) Ze(w, $[N], !0);
      return w;
    })({}, s.defaultProps, g) : g;
  } }), ct(c, function() {
    return ".".concat(c.styledComponentId);
  }), o && it(c, e, { attrs: !0, componentStyle: !0, displayName: !0, foldedComponentIds: !0, shouldForwardProp: !0, styledComponentId: !0, target: !0 }), c;
}
function Et(e, t) {
  for (var r = [e[0]], n = 0, s = t.length; n < s; n += 1) r.push(t[n], e[n + 1]);
  return r;
}
var _t = function(e) {
  return Object.assign(e, { isCss: !0 });
};
function ft(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  if (J(e) || ve(e)) return _t(K(Et(Fe, oe([e], t, !0))));
  var n = e;
  return t.length === 0 && n.length === 1 && typeof n[0] == "string" ? K(n) : _t(K(Et(n, t)));
}
function et(e, t, r) {
  if (r === void 0 && (r = ce), !t) throw j(1, t);
  var n = function(s) {
    for (var o = [], i = 1; i < arguments.length; i++) o[i - 1] = arguments[i];
    return e(t, r, ft.apply(void 0, oe([s], o, !1)));
  };
  return n.attrs = function(s) {
    return et(e, t, _(_({}, r), { attrs: Array.prototype.concat(r.attrs, s).filter(Boolean) }));
  }, n.withConfig = function(s) {
    return et(e, t, _(_({}, r), s));
  }, n;
}
var Jt = function(e) {
  return et(Jr, e);
}, Qr = Jt;
Mt.forEach(function(e) {
  Qr[e] = Jt(e);
});
var Xr = (function() {
  function e(t, r) {
    this.rules = t, this.componentId = r, this.isStatic = Zt(t), ue.registerId(this.componentId + 1);
  }
  return e.prototype.createStyles = function(t, r, n, s) {
    var o = s(ye(K(this.rules, r, n, s)), ""), i = this.componentId + t;
    n.insertRules(i, i, o);
  }, e.prototype.removeStyles = function(t, r) {
    r.clearRules(this.componentId + t);
  }, e.prototype.renderStyles = function(t, r, n, s) {
    t > 2 && ue.registerId(this.componentId + t);
    var o = this.componentId + t;
    this.isStatic ? n.hasNameForId(o, o) || this.createStyles(t, r, n, s) : (this.removeStyles(t, n), this.createStyles(t, r, n, s));
  }, e;
})();
function on(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  var n = ft.apply(void 0, oe([e], t, !1)), s = "sc-global-".concat(ot(JSON.stringify(n))), o = new Xr(n, s), i = /* @__PURE__ */ new WeakMap(), u = function(f) {
    var h = $e(), m = T ? void 0 : C.useContext(Q), d = i.get(h.styleSheet);
    if (d === void 0 && (d = h.styleSheet.allocateGSInstance(s), i.set(h.styleSheet, d)), (typeof window > "u" || !h.styleSheet.server) && (function(O, E, x, c, g) {
      if (o.isStatic) o.renderStyles(O, Cr, x, g);
      else {
        var w = _(_({}, E), { theme: st(E, c, u.defaultProps) });
        o.renderStyles(O, w, x, g);
      }
    })(d, f, h.styleSheet, m, h.stylis), !T) {
      var S = C.useRef(!0);
      C.useLayoutEffect(function() {
        return S.current = !1, function() {
          S.current = !0, queueMicrotask(function() {
            S.current && (o.removeStyles(d, h.styleSheet), typeof document < "u" && document.querySelectorAll('style[data-styled-global="'.concat(s, '"]')).forEach(function(O) {
              return O.remove();
            }));
          });
        };
      }, [d, h.styleSheet]);
    }
    if (T) {
      var y = s + d, b = typeof window > "u" ? h.styleSheet.getTag().getGroup(ne(y)) : "";
      if (b) {
        var I = "".concat(s, "-").concat(d);
        return C.createElement("style", { key: I, "data-styled-global": s, precedence: "styled-components", href: I, children: b });
      }
    }
    return null;
  };
  return C.memo(u);
}
function an(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  var n = ye(ft.apply(void 0, oe([e], t, !1))), s = ot(n);
  return new Kt(s, n);
}
function cn(e) {
  var t = C.forwardRef(function(r, n) {
    var s = st(r, T ? void 0 : C.useContext(Q), e.defaultProps);
    return C.createElement(e, _(_({}, r), { theme: s, ref: n }));
  });
  return t.displayName = "WithTheme(".concat(Gt(e), ")"), it(t, e);
}
var un = (function() {
  function e() {
    var t = this;
    this._emitSheetCSS = function() {
      var r = t.instance.toString();
      if (!r) return "";
      var n = Je(), s = ye([n && 'nonce="'.concat(n, '"'), "".concat(U, '="true"'), "".concat(Ne, '="').concat(ae, '"')].filter(Boolean), " ");
      return "<style ".concat(s, ">").concat(r, "</style>");
    }, this.getStyleTags = function() {
      if (t.sealed) throw j(2);
      return t._emitSheetCSS();
    }, this.getStyleElement = function() {
      var r;
      if (t.sealed) throw j(2);
      var n = t.instance.toString();
      if (!n) return [];
      var s = ((r = {})[U] = "", r[Ne] = ae, r.dangerouslySetInnerHTML = { __html: n }, r), o = Je();
      return o && (s.nonce = o), [C.createElement("style", _({}, s, { key: "sc-0-0" }))];
    }, this.seal = function() {
      t.sealed = !0;
    }, this.instance = new ue({ isServer: !0 }), this.sealed = !1;
  }
  return e.prototype.collectStyles = function(t) {
    if (this.sealed) throw j(2);
    return C.createElement(Hr, { sheet: this.instance }, t);
  }, e.prototype.interleaveWithNodeStream = function(t) {
    throw j(3);
  }, e;
})(), fn = { StyleSheet: ue, mainSheet: Ht };
export {
  un as ServerStyleSheet,
  tn as StyleSheetConsumer,
  ut as StyleSheetContext,
  Hr as StyleSheetManager,
  rn as ThemeConsumer,
  Q as ThemeContext,
  sn as ThemeProvider,
  fn as __PRIVATE__,
  on as createGlobalStyle,
  ft as css,
  Qr as default,
  at as isStyledComponent,
  an as keyframes,
  Qr as styled,
  nn as useTheme,
  ae as version,
  cn as withTheme
};
