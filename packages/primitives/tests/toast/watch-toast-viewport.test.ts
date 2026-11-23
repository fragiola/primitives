import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToastManager } from "../../src/toast/toast-manager.ts";
import { watchToastViewport } from "../../src/toast/watch-toast-viewport.ts";

// spec/toast.md, "Viewport", "Announcements", "Pausing"
describe("watchToastViewport", () => {
    let viewport: HTMLElement;
    let before: HTMLButtonElement;
    const stops: (() => void)[] = [];
    const watch = (
        ...args: Parameters<typeof watchToastViewport>
    ): ReturnType<typeof watchToastViewport> => {
        const watched = watchToastViewport(...args);
        stops.push(watched.stop);
        return watched;
    };

    beforeEach(() => {
        vi.useFakeTimers();
        before = document.createElement("button");
        before.textContent = "Before";
        viewport = document.createElement("div");
        viewport.tabIndex = -1;
        document.body.append(before, viewport);
    });
    afterEach(() => {
        for (const stop of stops.splice(0)) {
            stop();
        }
        document.body.replaceChildren();
        vi.useRealTimers();
    });

    const regions = () => ({
        polite: viewport.querySelector('[aria-live="polite"]'),
        assertive: viewport.querySelector('[aria-live="assertive"]'),
    });
    const texts = (element: Element | null) =>
        [...(element?.children ?? [])].map((child) => child.textContent);

    it("puts a polite and an assertive live region in the viewport before any toast", () => {
        const manager = createToastManager();
        const watched = watch(viewport, manager, {
            onExpandedChange: () => {},
        });
        const { polite, assertive } = regions();
        expect(viewport.firstElementChild).toBe(polite);
        expect(polite?.nextElementSibling).toBe(assertive);
        expect(polite?.getAttribute("aria-relevant")).toBe("additions text");
        expect(polite?.getAttribute("aria-atomic")).toBe("false");
        expect(polite?.getAttribute("data-primitives-part")).toBe(
            "toast-announcer",
        );
        expect(texts(polite)).toEqual([]);
        watched.stop();
        expect(viewport.children).toHaveLength(0);
    });

    it("announces each shown toast by its priority, in the order they show", () => {
        const manager = createToastManager({ limit: 2 });
        watch(viewport, manager, { onExpandedChange: () => {} });
        const a = manager.add({ title: "Saved", description: "Draft 1" });
        manager.add({ title: "Offline", priority: "high" });
        manager.add({ title: "Sent" });
        const { polite, assertive } = regions();
        // A is queued past the limit: its announcement leaves
        expect(texts(polite)).toEqual(["Sent"]);
        expect(texts(assertive)).toEqual(["Offline"]);
        manager.close();
        expect(texts(polite)).toEqual([]);
        expect(texts(assertive)).toEqual([]);
        manager.add({ title: "One" });
        manager.add({ title: "Two" });
        expect(texts(polite)).toEqual(["One", "Two"]);
        expect(manager.toasts().some((toast) => toast.id === a)).toBe(true);
    });

    it("an update changes the announcement's text", () => {
        const manager = createToastManager();
        watch(viewport, manager, { onExpandedChange: () => {} });
        const id = manager.add({ title: "Uploading" });
        const element = regions().polite?.firstElementChild;
        manager.update(id, { title: "Uploaded", description: "3 files" });
        expect(regions().polite?.firstElementChild).toBe(element);
        expect(element?.textContent).toBe("Uploaded 3 files");
    });

    it("pauses while hovered and expands, until no exit runs", () => {
        const manager = createToastManager({ timeout: 1000 });
        const expanded = vi.fn();
        watch(viewport, manager, { onExpandedChange: expanded });
        const id = manager.add({ title: "A" });
        manager.add({ title: "B" });
        viewport.dispatchEvent(
            new PointerEvent("pointerenter", { pointerType: "mouse" }),
        );
        expect(expanded).toHaveBeenLastCalledWith(true);
        vi.advanceTimersByTime(5000);
        expect(manager.toasts().some((toast) => toast.closing)).toBe(false);
        manager.close(id);
        viewport.dispatchEvent(
            new PointerEvent("pointerleave", { pointerType: "mouse" }),
        );
        // an exit still runs: it stays expanded
        expect(expanded).toHaveBeenCalledTimes(1);
        manager.remove(id);
        expect(expanded).toHaveBeenLastCalledWith(false);
        vi.advanceTimersByTime(1000);
        expect(manager.toasts()[0]?.closing).toBe(true);
    });

    it("pauses while the page is hidden", () => {
        const manager = createToastManager({ timeout: 1000 });
        watch(viewport, manager, { onExpandedChange: () => {} });
        manager.add({ title: "A" });
        const state = vi.spyOn(document, "visibilityState", "get");
        state.mockReturnValue("hidden");
        document.dispatchEvent(new Event("visibilitychange"));
        vi.advanceTimersByTime(5000);
        expect(manager.toasts()[0]?.closing).toBe(false);
        state.mockReturnValue("visible");
        document.dispatchEvent(new Event("visibilitychange"));
        vi.advanceTimersByTime(1000);
        expect(manager.toasts()[0]?.closing).toBe(true);
        state.mockRestore();
    });

    it("F6 focuses the viewport while it has toasts; F6 again goes back", () => {
        const manager = createToastManager();
        const expanded = vi.fn();
        watch(viewport, manager, { onExpandedChange: expanded });
        before.focus();
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "F6", bubbles: true }),
        );
        // no toast: F6 is the browser's
        expect(document.activeElement).toBe(before);
        manager.add({ title: "A" });
        before.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "F6",
                bubbles: true,
                cancelable: true,
            }),
        );
        expect(document.activeElement).toBe(viewport);
        expect(expanded).toHaveBeenLastCalledWith(true);
        viewport.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "F6",
                bubbles: true,
                cancelable: true,
            }),
        );
        expect(document.activeElement).toBe(before);
        expect(expanded).toHaveBeenLastCalledWith(false);
    });

    it("moves focus off a closing toast to the next one, else back", () => {
        const manager = createToastManager();
        const watched = watch(viewport, manager, {
            onExpandedChange: () => {},
        });
        manager.add({ title: "A" });
        const roots = ["A", "B"].map((name) => {
            const root = document.createElement("div");
            root.tabIndex = 0;
            root.textContent = name;
            root.setAttribute("data-primitives-part", "toast-root");
            viewport.append(root);
            return root;
        });
        const a = roots[0] as HTMLElement;
        const b = roots[1] as HTMLElement;
        before.focus();
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "F6",
                bubbles: true,
                cancelable: true,
            }),
        );
        a.focus();
        watched.focusAfterClose(a);
        expect(document.activeElement).toBe(b);
        a.setAttribute("data-ending-style", "");
        watched.focusAfterClose(b);
        expect(document.activeElement).toBe(before);
    });
});
