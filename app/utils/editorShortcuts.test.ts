import { describe, expect, it } from "vitest";

import { getEditorShortcut } from "./editorShortcuts";

const baseEvent = { key: "z", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false };

describe("getEditorShortcut", () => {
  it.each([
    [{ ...baseEvent, ctrlKey: true }, false, "undo"],
    [{ ...baseEvent, ctrlKey: true, shiftKey: true }, false, "redo"],
    [{ ...baseEvent, metaKey: true }, true, "undo"],
    [{ ...baseEvent, metaKey: true, shiftKey: true }, true, "redo"],
  ])("recognizes the platform shortcut", (event, isApplePlatform, expected) => {
    expect(getEditorShortcut(event, null, isApplePlatform)).toBe(expected);
  });

  it.each([
    [{ ...baseEvent, ctrlKey: true }, { tagName: "INPUT" }, false],
    [{ ...baseEvent, ctrlKey: true }, { tagName: "TEXTAREA" }, false],
    [{ ...baseEvent, ctrlKey: true }, { isContentEditable: true }, false],
    [{ ...baseEvent, ctrlKey: true, altKey: true }, null, false],
    [{ ...baseEvent, metaKey: true }, null, false],
    [{ ...baseEvent, ctrlKey: true, key: "y" }, null, false],
  ])("ignores unsupported contexts and combinations", (event, target, isApplePlatform) => {
    expect(getEditorShortcut(event, target, isApplePlatform)).toBeUndefined();
  });
});
