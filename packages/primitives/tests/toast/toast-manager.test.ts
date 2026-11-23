import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToastManager } from "../../src/toast/toast-manager.ts";

// spec/toast.md, "The toast queue". Every timer runs on a fixed (fake) clock.
describe("createToastManager", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    const ids = (manager: ReturnType<typeof createToastManager>) =>
        manager.toasts().map((toast) => toast.id);

    it("adds toasts newest first, with their defaults", () => {
        const manager = createToastManager();
        const first = manager.add({ title: "Saved" });
        const second = manager.add({ title: "Sent", priority: "high" });
        expect(ids(manager)).toEqual([second, first]);
        expect(manager.toasts()[0]).toMatchObject({
            title: "Sent",
            priority: "high",
            closing: false,
            limited: false,
            index: 0,
            updateKey: 0,
        });
        expect(manager.toasts()[1]?.priority).toBe("low");
        expect(manager.toasts()[1]?.index).toBe(1);
    });

    it("notifies subscribers and keeps the same array until a change", () => {
        const manager = createToastManager();
        const listener = vi.fn();
        const unsubscribe = manager.subscribe(listener);
        const before = manager.toasts();
        expect(manager.toasts()).toBe(before);
        manager.add({ title: "A" });
        expect(listener).toHaveBeenCalledOnce();
        expect(manager.toasts()).not.toBe(before);
        unsubscribe();
        manager.add({ title: "B" });
        expect(listener).toHaveBeenCalledOnce();
    });

    it("closes a toast after its timeout, and marks it closing until removed", () => {
        const manager = createToastManager({ timeout: 1000 });
        const onClose = vi.fn();
        const onRemove = vi.fn();
        const id = manager.add({ title: "A", onClose, onRemove });
        vi.advanceTimersByTime(999);
        expect(manager.toasts()[0]?.closing).toBe(false);
        vi.advanceTimersByTime(1);
        expect(manager.toasts()[0]?.closing).toBe(true);
        expect(onClose).toHaveBeenCalledOnce();
        expect(onRemove).not.toHaveBeenCalled();
        manager.remove(id);
        expect(manager.toasts()).toEqual([]);
        expect(onRemove).toHaveBeenCalledOnce();
    });

    it("takes a per-toast timeout; 0 never closes", () => {
        const manager = createToastManager({ timeout: 1000 });
        manager.add({ id: "long", title: "A", timeout: 3000 });
        manager.add({ id: "sticky", title: "B", timeout: 0 });
        vi.advanceTimersByTime(2999);
        expect(manager.toasts().every((toast) => !toast.closing)).toBe(true);
        vi.advanceTimersByTime(1);
        expect(manager.toasts().find((t) => t.id === "long")?.closing).toBe(
            true,
        );
        vi.advanceTimersByTime(60_000);
        expect(manager.toasts().find((t) => t.id === "sticky")?.closing).toBe(
            false,
        );
    });

    it("updates a toast in place and counts the update", () => {
        const manager = createToastManager();
        const id = manager.add({ title: "Uploading" });
        manager.update(id, { title: "Uploaded", type: "success" });
        expect(manager.toasts()[0]).toMatchObject({
            id,
            title: "Uploaded",
            type: "success",
            updateKey: 1,
        });
        manager.update(id, (toast) => ({ description: `${toast.title}!` }));
        expect(manager.toasts()[0]?.description).toBe("Uploaded!");
        manager.close(id);
        manager.update(id, { title: "ignored" });
        expect(manager.toasts()[0]?.title).toBe("Uploaded");
        manager.update("unknown", { title: "x" });
    });

    it("upserts by id: the open toast changes and its timer restarts", () => {
        const manager = createToastManager({ timeout: 1000 });
        manager.add({ id: "sync", title: "Syncing" });
        vi.advanceTimersByTime(800);
        manager.add({ id: "sync", title: "Synced" });
        expect(manager.toasts()).toHaveLength(1);
        expect(manager.toasts()[0]?.title).toBe("Synced");
        vi.advanceTimersByTime(800);
        expect(manager.toasts()[0]?.closing).toBe(false);
        vi.advanceTimersByTime(200);
        expect(manager.toasts()[0]?.closing).toBe(true);
        // a closing toast with that id leaves at once, and a new one takes its place
        manager.add({ id: "sync", title: "Again" });
        expect(manager.toasts()).toHaveLength(1);
        expect(manager.toasts()[0]).toMatchObject({
            title: "Again",
            closing: false,
        });
    });

    it("closes every toast without an id", () => {
        const manager = createToastManager();
        manager.add({ title: "A" });
        manager.add({ title: "B" });
        manager.close();
        expect(manager.toasts().every((toast) => toast.closing)).toBe(true);
    });

    it("queues toasts past the limit; a queued one's timer waits until it shows", () => {
        const manager = createToastManager({ limit: 2, timeout: 1000 });
        const a = manager.add({ title: "A" });
        vi.advanceTimersByTime(500);
        const b = manager.add({ title: "B" });
        const c = manager.add({ title: "C" });
        expect(manager.toasts().map((toast) => toast.limited)).toEqual([
            false,
            false,
            true,
        ]);
        expect(manager.toasts().find((t) => t.id === a)?.limited).toBe(true);
        // A waited from 500 ms: it has 500 ms left once it shows again
        vi.advanceTimersByTime(1000);
        expect(
            manager
                .toasts()
                .filter((toast) => toast.closing)
                .map((toast) => toast.id)
                .sort(),
        ).toEqual([b, c].sort());
        expect(manager.toasts().find((t) => t.id === a)?.limited).toBe(false);
        vi.advanceTimersByTime(499);
        expect(manager.toasts().find((t) => t.id === a)?.closing).toBe(false);
        vi.advanceTimersByTime(1);
        expect(manager.toasts().find((t) => t.id === a)?.closing).toBe(true);
    });

    it("pauses every timer while any source pauses, keeping what was left", () => {
        const manager = createToastManager({ timeout: 1000 });
        manager.add({ title: "A" });
        vi.advanceTimersByTime(600);
        manager.pause("hover");
        manager.pause("focus");
        vi.advanceTimersByTime(5000);
        expect(manager.toasts()[0]?.closing).toBe(false);
        manager.resume("hover");
        vi.advanceTimersByTime(5000);
        expect(manager.toasts()[0]?.closing).toBe(false);
        manager.resume("focus");
        vi.advanceTimersByTime(399);
        expect(manager.toasts()[0]?.closing).toBe(false);
        vi.advanceTimersByTime(1);
        expect(manager.toasts()[0]?.closing).toBe(true);
    });

    it("a toast added while paused waits for the resume", () => {
        const manager = createToastManager({ timeout: 1000 });
        manager.pause("hidden");
        manager.add({ title: "A" });
        vi.advanceTimersByTime(5000);
        expect(manager.toasts()[0]?.closing).toBe(false);
        manager.resume("hidden");
        vi.advanceTimersByTime(1000);
        expect(manager.toasts()[0]?.closing).toBe(true);
    });

    it("a promise toast is loading (no timer), then success or error", async () => {
        const manager = createToastManager({ timeout: 1000 });
        let resolve: (value: number) => void = () => {};
        const result = manager.promise(
            new Promise<number>((done) => {
                resolve = done;
            }),
            {
                loading: "Saving",
                success: (value) => ({
                    title: `Saved ${value}`,
                    timeout: 2000,
                }),
                error: "Failed",
            },
        );
        expect(manager.toasts()[0]).toMatchObject({
            title: "Saving",
            type: "loading",
        });
        vi.advanceTimersByTime(10_000);
        expect(manager.toasts()[0]?.closing).toBe(false);
        resolve(3);
        await expect(result).resolves.toBe(3);
        expect(manager.toasts()[0]).toMatchObject({
            title: "Saved 3",
            type: "success",
        });
        vi.advanceTimersByTime(1999);
        expect(manager.toasts()[0]?.closing).toBe(false);
        vi.advanceTimersByTime(1);
        expect(manager.toasts()[0]?.closing).toBe(true);

        const failing = manager.promise(Promise.reject(new Error("no")), {
            loading: { title: "Sending", priority: "high" },
            success: "Sent",
            error: (error) => (error as Error).message,
        });
        await expect(failing).rejects.toThrow("no");
        expect(manager.toasts()[0]).toMatchObject({
            title: "no",
            type: "error",
            priority: "high",
        });
    });

    it("stacks the heights: each toast's offset is the heights in front of it", () => {
        const manager = createToastManager();
        const a = manager.add({ title: "A" });
        const b = manager.add({ title: "B" });
        const c = manager.add({ title: "C" });
        manager.setHeight(c, 40);
        manager.setHeight(b, 60);
        manager.setHeight(a, 50);
        expect(
            manager.toasts().map((toast) => [toast.offsetY, toast.height]),
        ).toEqual([
            [0, 40],
            [40, 60],
            [100, 50],
        ]);
        // a closing toast's height leaves the stack; it keeps its list index
        manager.close(b);
        expect(
            manager
                .toasts()
                .map((toast) => [toast.index, toast.offsetY, toast.height]),
        ).toEqual([
            [0, 0, 40],
            [1, 40, 0],
            [1, 40, 50],
        ]);
    });

    it("configures the limit and the default timeout", () => {
        const manager = createToastManager();
        manager.add({ title: "A" });
        manager.add({ title: "B" });
        manager.configure({ limit: 1 });
        expect(manager.toasts().map((toast) => toast.limited)).toEqual([
            false,
            true,
        ]);
        manager.configure({ timeout: 100 });
        manager.add({ title: "C" });
        vi.advanceTimersByTime(100);
        expect(manager.toasts()[0]?.closing).toBe(true);
    });
});
