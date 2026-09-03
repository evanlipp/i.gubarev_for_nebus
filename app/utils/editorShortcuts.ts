export type EditorShortcut = "undo" | "redo";

interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

interface ShortcutTarget {
  tagName?: string;
  isContentEditable?: boolean;
}

export function getEditorShortcut(
  event: ShortcutEvent,
  target: ShortcutTarget | null,
  isApplePlatform: boolean,
): EditorShortcut | undefined {
  const modifierPressed = isApplePlatform ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  if (!modifierPressed || event.altKey || ["INPUT", "TEXTAREA"].includes(target?.tagName ?? "") || target?.isContentEditable) {
    return undefined;
  }

  if (event.key.toLowerCase() !== "z") {
    return undefined;
  }

  return event.shiftKey ? "redo" : "undo";
}
