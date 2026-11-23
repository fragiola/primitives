import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRotationTimer } from "../../src/carousel/rotation-timer.ts";

// spec/carousel.md, "The rotation". The timers run on a fake clock.
describe("createRotationTimer", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("elapses once after its delay, and starts again from the whole delay", () => {
        const timer = createRotationTimer(document.body);
        const elapse = vi.fn();
        timer.start(3000, elapse);
        vi.advanceTimersByTime(2000);
        timer.start(3000, elapse);
        vi.advanceTimersByTime(2999);
        expect(elapse).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(elapse).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(10000);
        expect(elapse).toHaveBeenCalledTimes(1);
    });

    it("keeps the time it had left across a pause", () => {
        const timer = createRotationTimer(document.body);
        const elapse = vi.fn();
        timer.start(3000, elapse);
        vi.advanceTimersByTime(1000);
        timer.pause();
        vi.advanceTimersByTime(10000);
        expect(elapse).not.toHaveBeenCalled();
        timer.resume();
        vi.advanceTimersByTime(1999);
        expect(elapse).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(elapse).toHaveBeenCalledTimes(1);
    });

    it("waits for a resume when started while paused", () => {
        const timer = createRotationTimer(document.body);
        const elapse = vi.fn();
        timer.pause();
        timer.start(500, elapse);
        vi.advanceTimersByTime(1000);
        expect(elapse).not.toHaveBeenCalled();
        timer.resume();
        vi.advanceTimersByTime(500);
        expect(elapse).toHaveBeenCalledTimes(1);
    });

    it("stops", () => {
        const timer = createRotationTimer(document.body);
        const elapse = vi.fn();
        timer.start(500, elapse);
        timer.stop();
        timer.pause();
        timer.resume();
        vi.advanceTimersByTime(1000);
        expect(elapse).not.toHaveBeenCalled();
    });
});
