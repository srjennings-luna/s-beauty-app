"use client";

import { VisualEditing } from "@sanity/visual-editing/react";

/**
 * Client-side wrapper for Sanity's VisualEditing bridge. Must be a client
 * component because VisualEditing uses React context under the hood and
 * can't be evaluated during Next.js server collection. The script is a
 * near-no-op for visitors not inside a Sanity Studio iframe.
 */
export default function VisualEditingClient() {
  return <VisualEditing portal />;
}
