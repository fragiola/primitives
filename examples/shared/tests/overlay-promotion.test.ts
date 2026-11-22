// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    armedRule,
    isHostMessage,
    MODAL_POPUP_PARTS,
    MODAL_TRIGGER_PARTS,
    modalOpen,
    modalTriggerOf,
    promoteOverlays,
} from "../src/embed/overlay-promotion.ts";

// The embed's half of overlay promotion (contract §5.4), framework-free: keyed off the part
// attribute, never a framework. The e2e suite checks it in each framework's embed, in a frame.

const geometry = {
    rect: { x: 40, y: 120, width: 720, height: 400 },
    viewport: { width: 1280, height: 720 },
};

describe("overlay promotion", () => {
    it("knows the modal parts by their part attribute", () => {
        expect(MODAL_TRIGGER_PARTS).toEqual([
            "dialog-trigger",
            "alert-dialog-trigger",
            "drawer-trigger",
        ]);
        expect(MODAL_POPUP_PARTS).toEqual([
            "dialog-popup",
            "alert-dialog-popup",
            "drawer-popup",
        ]);
        document.body.innerHTML =
            '<button data-primitives-part="dialog-trigger"><span id="label">Open</span></button><button id="other">Other</button>';
        expect(modalTriggerOf(document.getElementById("label"))).toBe(
            document.querySelector("button"),
        );
        expect(modalTriggerOf(document.getElementById("other"))).toBeNull();
        expect(modalOpen(document)).toBe(false);
        document.body.insertAdjacentHTML(
            "beforeend",
            '<div data-primitives-part="dialog-popup"></div>',
        );
        expect(modalOpen(document)).toBe(true);
    });

    it("pins the stage to the frame's rect, only in the promoted viewport", () => {
        const rule = armedRule(geometry);
        expect(rule).toContain("@media (width: 1280px) and (height: 720px)");
        expect(rule).toContain("[data-embed-stage]");
        expect(rule).toContain("left: 40px;");
        expect(rule).toContain("top: 120px;");
        expect(rule).toContain("width: 720px;");
        expect(rule).toContain("html, body { background: transparent; }");
    });

    it("accepts only well-formed host messages", () => {
        expect(
            isHostMessage({ type: "fragiola:example:host", overlay: true }),
        ).toBe(true);
        expect(
            isHostMessage({ type: "fragiola:example:host", overlay: false }),
        ).toBe(false);
        expect(
            isHostMessage({ type: "fragiola:example:promote", ...geometry }),
        ).toBe(true);
        expect(
            isHostMessage({
                type: "fragiola:example:promoted",
                rect: { ...geometry.rect, x: Number.NaN },
                viewport: geometry.viewport,
            }),
        ).toBe(false);
        expect(isHostMessage({ type: "fragiola:example:theme" })).toBe(false);
        expect(isHostMessage(null)).toBe(false);
    });

    describe("in a frame", () => {
        const posted: unknown[] = [];
        let stop: () => void = () => {};
        const parent = {
            postMessage: (message: unknown) => posted.push(message),
        };
        const fromHost = (data: unknown) =>
            window.dispatchEvent(
                new MessageEvent("message", {
                    data,
                    origin: location.origin,
                    source: parent as unknown as Window,
                }),
            );

        beforeEach(() => {
            vi.useFakeTimers();
            posted.length = 0;
            vi.spyOn(window, "parent", "get").mockReturnValue(
                parent as unknown as Window,
            );
            document.body.innerHTML =
                '<div data-embed-stage><button data-primitives-part="dialog-trigger">Open</button></div>';
        });
        afterEach(() => {
            stop();
            vi.restoreAllMocks();
            vi.useRealTimers();
        });

        it("holds the trigger's click until the frame is promoted, then plays it", async () => {
            stop = promoteOverlays("dialog");
            const trigger = document.querySelector("button") as HTMLElement;
            const clicks: number[] = [];
            trigger.addEventListener("click", () => clicks.push(1));

            // before `host`, nothing is intercepted
            trigger.click();
            expect(clicks).toHaveLength(1);
            expect(posted).toEqual([]);

            fromHost({ type: "fragiola:example:host", overlay: true });
            trigger.click();
            expect(clicks).toHaveLength(1);
            expect(posted).toEqual([
                { type: "fragiola:example:overlay", id: "dialog", open: true },
            ]);

            fromHost({ type: "fragiola:example:promote", ...geometry });
            expect(posted.at(-1)).toEqual({
                type: "fragiola:example:armed",
                id: "dialog",
            });
            expect(
                document.querySelector("style[data-armed]")?.textContent,
            ).toBe(armedRule(geometry));

            fromHost({ type: "fragiola:example:promoted", ...geometry });
            expect(clicks).toHaveLength(2);

            // the popup mounts, then unmounts once it has closed: the frame goes back
            const popup = document.createElement("div");
            popup.dataset.primitivesPart = "dialog-popup";
            document.body.append(popup);
            await vi.advanceTimersByTimeAsync(400);
            popup.remove();
            await vi.advanceTimersByTimeAsync(0);
            expect(posted.at(-1)).toEqual({
                type: "fragiola:example:overlay",
                id: "dialog",
                open: false,
            });
        });

        it("plays the click in place when the site never promotes", async () => {
            stop = promoteOverlays("dialog");
            const trigger = document.querySelector("button") as HTMLElement;
            const clicks: number[] = [];
            trigger.addEventListener("click", () => clicks.push(1));
            fromHost({ type: "fragiola:example:host", overlay: true });
            trigger.click();
            expect(clicks).toHaveLength(0);
            await vi.advanceTimersByTimeAsync(300);
            expect(clicks).toHaveLength(1);
            // it opened nothing: the frame is not left promoted
            await vi.advanceTimersByTimeAsync(300);
            expect(posted.at(-1)).toEqual({
                type: "fragiola:example:overlay",
                id: "dialog",
                open: false,
            });
        });
    });
});
