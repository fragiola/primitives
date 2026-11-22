import { afterEach, describe, expect, it, vi } from "vitest";
import { interceptEscape } from "../../src/layers/intercept-escape.ts";
import { pushLayer } from "../../src/layers/layer-stack.ts";

afterEach(() => {
    document.body.innerHTML = "";
});

describe("interceptEscape", () => {
    it("takes Escape before the layers, so an enclosing layer stays open", () => {
        const layerEscape = vi.fn();
        const layer = pushLayer(document, {
            elements: () => [],
            onEscape: layerEscape,
        });
        const intercepted = vi.fn();
        const stop = interceptEscape(document, intercepted);
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(intercepted).toHaveBeenCalledOnce();
        expect(layerEscape).not.toHaveBeenCalled();
        stop();
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(intercepted).toHaveBeenCalledOnce();
        expect(layerEscape).toHaveBeenCalledOnce();
        layer.remove();
    });

    it("ignores other keys", () => {
        const intercepted = vi.fn();
        const stop = interceptEscape(document, intercepted);
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
        expect(intercepted).not.toHaveBeenCalled();
        stop();
    });

    it("takes only the keys `when` accepts, and leaves the others to the layers", () => {
        const layerEscape = vi.fn();
        const layer = pushLayer(document, {
            elements: () => [],
            onEscape: layerEscape,
        });
        const inside = document.createElement("button");
        const outside = document.createElement("button");
        document.body.append(inside, outside);
        const intercepted = vi.fn();
        const stop = interceptEscape(document, intercepted, {
            when: (event) => inside.contains(event.target as Node),
        });
        outside.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(intercepted).not.toHaveBeenCalled();
        expect(layerEscape).toHaveBeenCalledOnce();
        inside.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(intercepted).toHaveBeenCalledOnce();
        expect(layerEscape).toHaveBeenCalledOnce();
        stop();
        layer.remove();
    });
});
