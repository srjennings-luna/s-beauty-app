"use client";

import { useCallback, useEffect, useState } from "react";
import { getVisioNote, setVisioNote } from "@/lib/userData";

// Per-artwork Visio Divina note. The user can write a private response
// to the Action step on the Visio Divina page; this hook reads and
// writes that note. Empty string means no note (and removes the key
// on save).
//
// Auth-ready: when auth ships, implementation swap moves the note
// storage off localStorage onto the authenticated user record. Hook
// surface does not change.
export default function useVisioNote(artworkId: string | null | undefined) {
  const [note, setNoteState] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!artworkId) {
      setNoteState("");
      setReady(true);
      return;
    }
    setNoteState(getVisioNote(artworkId));
    setReady(true);
  }, [artworkId]);

  const saveNote = useCallback(
    (text: string) => {
      if (!artworkId) return;
      setVisioNote(artworkId, text);
      setNoteState(text);
    },
    [artworkId],
  );

  return { note, ready, saveNote };
}
