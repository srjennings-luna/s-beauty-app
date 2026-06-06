// Contueri · audioEvents
//
// Cross-stream audio coordination events. The app has three audio
// streams that need to coordinate:
//
//   1. NARRATION (TTS voice-over via NarrationButton) — highest
//      priority. When active, both Auditio and ambient pause.
//   2. AUDITIO (per-prompt curated music — Veni Creator, etc. — via
//      PromptClient or CircularAudioPlayer) — middle priority. When
//      active, ambient pauses (but narration can still interrupt).
//   3. AMBIENT (continuous background sound via AmbientSoundProvider) —
//      lowest priority. Pauses for either narration OR Auditio.
//
// Each stream dispatches a START event when it begins playback and an
// END event when it stops. The AmbientSoundProvider listens to all
// four events and uses a refcount so it stays paused while ANY higher
// stream is active and only auto-resumes when the count reaches zero.
//
// The CircularAudioPlayer (Journey Day Auditio) and PromptClient
// (P&P Auditio) both subscribe to NARRATION_* events for their own
// pause-during-TTS logic — that pattern predates this file and stays.
//
// Event payloads are intentionally empty: dispatchers send
// `new CustomEvent(NAME)` and listeners just count the fires. If we
// ever need per-source info (e.g. "which Auditio is playing"), we'd
// upgrade the payloads then.

export const NARRATION_START_EVENT = "contueri-narration-start";
export const NARRATION_END_EVENT = "contueri-narration-end";

export const AUDITIO_START_EVENT = "contueri-auditio-start";
export const AUDITIO_END_EVENT = "contueri-auditio-end";
