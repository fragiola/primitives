import { afterEach, describe, expect, it } from "vitest";
import {
    openEyeDropper,
    supportsEyeDropper,
} from "../../src/color/eye-dropper.ts";

const view = window as Window & { EyeDropper?: unknown };

afterEach(() => {
    delete view.EyeDropper;
});

function stub(open: () => Promise<{ sRGBHex: string }>): void {
    view.EyeDropper = class {
        open = open;
    };
}

describe("supportsEyeDropper", () => {
    it("reads the API on the element's window", () => {
        expect(supportsEyeDropper(document.body)).toBe(false);
        stub(() => Promise.resolve({ sRGBHex: "#000000" }));
        expect(supportsEyeDropper(document.body)).toBe(true);
    });
});

describe("openEyeDropper", () => {
    it("resolves with the picked color, as rgb", async () => {
        stub(() => Promise.resolve({ sRGBHex: "#336699" }));
        await expect(openEyeDropper(document.body)).resolves.toEqual({
            space: "rgb",
            red: 51,
            green: 102,
            blue: 153,
            alpha: 1,
        });
    });

    it("resolves with null when the pick is cancelled", async () => {
        stub(() => Promise.reject(new DOMException("aborted", "AbortError")));
        await expect(openEyeDropper(document.body)).resolves.toBeNull();
    });

    it("resolves with null with no EyeDropper API", async () => {
        await expect(openEyeDropper(document.body)).resolves.toBeNull();
    });
});
