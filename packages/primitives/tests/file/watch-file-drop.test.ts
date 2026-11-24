import { afterEach, describe, expect, it, vi } from "vitest";
import { assignFiles } from "../../src/file/assign-files.ts";
import { openFileDialog } from "../../src/file/open-file-dialog.ts";
import { watchFileDrop } from "../../src/file/watch-file-drop.ts";

afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
});

/** A drag event carrying `types` and `files` (jsdom has no DataTransfer). */
function drag(type: string, types: string[], files: File[] = []): Event {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
        value: { types, files, dropEffect: "none" },
    });
    return event;
}

function setup(disabled = false) {
    const element = document.createElement("div");
    const child = document.createElement("span");
    element.append(child);
    document.body.append(element);
    const changes: boolean[] = [];
    const drops: [string[], string][] = [];
    const presses: string[] = [];
    const stop = watchFileDrop(element, {
        disabled: () => disabled,
        onDropTargetChange: (active) => changes.push(active),
        onFiles: (files, reason) =>
            drops.push([files.map((file) => file.name), reason]),
        onActivate: (event) => presses.push(event.type),
    });
    return { element, child, changes, drops, presses, stop };
}

describe("watchFileDrop", () => {
    it("counts a drag of files across children, and takes its drop", () => {
        const { element, child, changes, drops } = setup();
        element.dispatchEvent(drag("dragenter", ["Files"]));
        child.dispatchEvent(drag("dragenter", ["Files"]));
        element.dispatchEvent(drag("dragleave", ["Files"]));
        expect(changes).toEqual([true]);
        const over = drag("dragover", ["Files"]);
        child.dispatchEvent(over);
        expect(over.defaultPrevented).toBe(true);
        const drop = drag("drop", ["Files"], [new File(["x"], "a.png")]);
        child.dispatchEvent(drop);
        expect(drop.defaultPrevented).toBe(true);
        expect(changes).toEqual([true, false]);
        expect(drops).toEqual([[["a.png"], "drop"]]);
    });

    it("leaves a drag of anything else alone", () => {
        const { element, changes } = setup();
        const enter = drag("dragenter", ["text/plain"]);
        element.dispatchEvent(enter);
        expect(enter.defaultPrevented).toBe(false);
        expect(changes).toEqual([]);
    });

    it("takes nothing while disabled, but cancels the drop", () => {
        const { element, changes, drops, presses } = setup(true);
        element.dispatchEvent(drag("dragenter", ["Files"]));
        const drop = drag("drop", ["Files"], [new File(["x"], "a.png")]);
        element.dispatchEvent(drop);
        expect(drop.defaultPrevented).toBe(true);
        element.click();
        expect([changes, drops, presses]).toEqual([[], [], []]);
    });

    it("takes a paste of files, and presses on click, Enter and Space", () => {
        const { element, drops, presses, stop } = setup();
        const paste = new Event("paste", { cancelable: true });
        Object.defineProperty(paste, "clipboardData", {
            value: { files: [new File(["x"], "b.png")] },
        });
        element.dispatchEvent(paste);
        expect(drops).toEqual([[["b.png"], "paste"]]);
        element.click();
        element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        const space = new KeyboardEvent("keydown", {
            key: " ",
            cancelable: true,
        });
        element.dispatchEvent(space);
        expect(space.defaultPrevented).toBe(true);
        expect(presses).toEqual(["click", "keydown"]);
        element.dispatchEvent(new KeyboardEvent("keyup", { key: " " }));
        expect(presses).toEqual(["click", "keydown", "keyup"]);
        // a Space released after the focus left is no press
        element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
        element.dispatchEvent(new FocusEvent("blur"));
        element.dispatchEvent(new KeyboardEvent("keyup", { key: " " }));
        element.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", repeat: true }),
        );
        stop();
        element.click();
        expect(presses).toHaveLength(3);
    });
});

describe("openFileDialog", () => {
    it("clicks a file input that is never in the document", () => {
        const click = vi
            .spyOn(HTMLInputElement.prototype, "click")
            .mockImplementation(function (this: HTMLInputElement) {
                expect(this.isConnected).toBe(false);
                expect(this.type).toBe("file");
                expect(this.accept).toBe("image/*,.pdf");
                expect(this.multiple).toBe(true);
                Object.defineProperty(this, "files", {
                    value: [new File(["x"], "a.png")],
                });
                this.dispatchEvent(new Event("change"));
            });
        const picked: string[] = [];
        openFileDialog(
            document.body,
            { accept: ["image/*", ".pdf"], multiple: true },
            (files) => picked.push(...files.map((file) => file.name)),
        );
        expect(click).toHaveBeenCalledOnce();
        expect(picked).toEqual(["a.png"]);
    });
});

describe("assignFiles", () => {
    it("reports false where the window has no DataTransfer", () => {
        const input = document.createElement("input");
        input.type = "file";
        const view = input.ownerDocument.defaultView as unknown as {
            DataTransfer?: unknown;
        };
        const saved = view.DataTransfer;
        view.DataTransfer = undefined;
        try {
            expect(assignFiles(input, [])).toBe(false);
        } finally {
            view.DataTransfer = saved;
        }
    });
});

describe("watchFileDrop and a file input inside the target", () => {
    it("is no press when the input's own click bubbles up", () => {
        const { element, presses } = setup();
        const input = document.createElement("input");
        input.type = "file";
        element.append(input);
        input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(presses).toEqual([]);
    });
});
