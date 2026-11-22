import { afterEach, describe, expect, it } from "vitest";
import { blockOutsidePointer } from "../../src/inert/block-outside-pointer.ts";

afterEach(() => {
    document.body.removeAttribute("style");
});

describe("blockOutsidePointer", () => {
    it("turns the body's pointer events off and restores them, counting nested blocks", () => {
        document.body.style.pointerEvents = "auto";
        const outer = blockOutsidePointer(document);
        expect(document.body.style.pointerEvents).toBe("none");
        const inner = blockOutsidePointer(document);
        inner();
        inner();
        expect(document.body.style.pointerEvents).toBe("none");
        outer();
        expect(document.body.style.pointerEvents).toBe("auto");
    });
});
