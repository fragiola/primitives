import { afterEach, describe, expect, it, vi } from "vitest";
import { announceText } from "../../src/clipboard/announce-text.ts";
import { writeClipboard } from "../../src/clipboard/write-clipboard.ts";

afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
});

function clipboardOf(value: unknown): void {
    Object.defineProperty(window.navigator, "clipboard", {
        value,
        configurable: true,
    });
}

describe("writeClipboard", () => {
    it("writes the text through the element's window", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        clipboardOf({ writeText });
        const button = document.createElement("button");
        document.body.append(button);
        await writeClipboard(button, "npm i @fragiola/primitives");
        expect(writeText).toHaveBeenCalledWith("npm i @fragiola/primitives");
    });

    it("rejects when the browser refuses the write", async () => {
        clipboardOf({
            writeText: () => Promise.reject(new Error("NotAllowedError")),
        });
        await expect(writeClipboard(document.body, "text")).rejects.toThrow(
            "NotAllowedError",
        );
    });

    it("rejects when writeText throws synchronously", async () => {
        clipboardOf({
            writeText: () => {
                throw new Error("SecurityError");
            },
        });
        await expect(writeClipboard(document.body, "text")).rejects.toThrow(
            "SecurityError",
        );
    });

    it("rejects with no Clipboard API (an insecure context)", async () => {
        clipboardOf(undefined);
        await expect(writeClipboard(document.body, "text")).rejects.toThrow(
            "not available",
        );
    });
});

describe("announceText", () => {
    it("replaces the region's text with a new node each time", () => {
        const region = document.createElement("span");
        document.body.append(region);
        announceText(region, "Copied");
        const first = region.firstChild;
        expect(region.textContent).toBe("Copied");
        announceText(region, "Copied");
        expect(region.textContent).toBe("Copied");
        expect(region.childNodes).toHaveLength(1);
        expect(region.firstChild).not.toBe(first);
        announceText(region, "");
        expect(region.childNodes).toHaveLength(0);
    });
});
