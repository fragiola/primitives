import { describe, expect, it, vi } from "vitest";
import { watchImageStatus } from "../../src/image/watch-image-status.ts";

/** A stand-in for a window's `Image`: it loads when the test says so. */
class FakeImage extends EventTarget {
    static created: FakeImage[] = [];
    static cached = new Set<string>();
    src = "";
    srcset = "";
    sizes = "";
    crossOrigin: string | null = null;
    referrerPolicy = "";
    naturalWidth = 0;
    constructor() {
        super();
        FakeImage.created.push(this);
    }
    get complete(): boolean {
        if (FakeImage.cached.has(this.src)) {
            this.naturalWidth = 40;
            return true;
        }
        return false;
    }
    finish(width: number) {
        this.naturalWidth = width;
        this.dispatchEvent(new Event("load"));
    }
    fail() {
        this.dispatchEvent(new Event("error"));
    }
}

/** An element whose window is the fake one (never the global window). */
function elementOf(Image: typeof FakeImage | null): Element {
    return {
        ownerDocument: { defaultView: Image === null ? null : { Image } },
    } as unknown as Element;
}

function latestImage(): FakeImage {
    const image = FakeImage.created.at(-1);
    if (image === undefined) throw new Error("no image created");
    return image;
}

describe("watchImageStatus", () => {
    it("reports loading, then loaded, through the element's window", () => {
        const onStatus = vi.fn();
        watchImageStatus(
            elementOf(FakeImage),
            "/ada.svg",
            {
                srcSet: "/ada.svg 1x",
                sizes: "40px",
                crossOrigin: "anonymous",
                referrerPolicy: "no-referrer",
            },
            onStatus,
        );
        const image = latestImage();
        expect(image).toMatchObject({
            src: "/ada.svg",
            srcset: "/ada.svg 1x",
            sizes: "40px",
            crossOrigin: "anonymous",
            referrerPolicy: "no-referrer",
        });
        expect(onStatus.mock.calls).toEqual([["loading"]]);
        image.finish(40);
        expect(onStatus.mock.calls).toEqual([["loading"], ["loaded"]]);
    });

    it("reports an error for a failed image, or one with no size", () => {
        const onStatus = vi.fn();
        watchImageStatus(elementOf(FakeImage), "/missing.svg", {}, onStatus);
        latestImage().fail();
        expect(onStatus.mock.calls).toEqual([["loading"], ["error"]]);
        const empty = vi.fn();
        watchImageStatus(elementOf(FakeImage), "/empty.svg", {}, empty);
        latestImage().finish(0);
        expect(empty.mock.calls).toEqual([["loading"], ["error"]]);
    });

    it("reports an error at once with no src and no srcset", () => {
        const onStatus = vi.fn();
        const count = FakeImage.created.length;
        watchImageStatus(elementOf(FakeImage), undefined, {}, onStatus);
        watchImageStatus(elementOf(FakeImage), "", { srcSet: "" }, onStatus);
        expect(onStatus.mock.calls).toEqual([["error"], ["error"]]);
        expect(FakeImage.created.length).toBe(count);
    });

    it("loads a srcset alone", () => {
        const onStatus = vi.fn();
        watchImageStatus(
            elementOf(FakeImage),
            undefined,
            { srcSet: "/ada.svg 1x" },
            onStatus,
        );
        expect(onStatus.mock.calls).toEqual([["loading"]]);
    });

    it("reports a cached image loaded synchronously, with no loading", () => {
        FakeImage.cached.add("/cached.svg");
        const onStatus = vi.fn();
        watchImageStatus(elementOf(FakeImage), "/cached.svg", {}, onStatus);
        expect(onStatus.mock.calls).toEqual([["loaded"]]);
        // its load event, if the browser still fires one, reports nothing new
        latestImage().finish(40);
        expect(onStatus.mock.calls).toEqual([["loaded"]]);
    });

    it("reports nothing after its cleanup", () => {
        const onStatus = vi.fn();
        const stop = watchImageStatus(
            elementOf(FakeImage),
            "/slow.svg",
            {},
            onStatus,
        );
        stop();
        latestImage().finish(40);
        expect(onStatus.mock.calls).toEqual([["loading"]]);
    });

    it("reports an error for an element with no window", () => {
        const onStatus = vi.fn();
        watchImageStatus(elementOf(null), "/ada.svg", {}, onStatus);
        expect(onStatus.mock.calls).toEqual([["error"]]);
    });
});
