import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDelayGroup } from "../../src/hover/delay-group.ts";
import { createHoverIntent } from "../../src/hover/hover-intent.ts";

describe("createHoverIntent", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("opens after the delay unless the pointer leaves first", () => {
        const open = vi.fn();
        const close = vi.fn();
        const intent = createHoverIntent({ open, close });
        intent.enter(500);
        vi.advanceTimersByTime(499);
        expect(open).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(open).toHaveBeenCalledOnce();

        intent.enter(500);
        vi.advanceTimersByTime(200);
        intent.cancel();
        vi.advanceTimersByTime(1000);
        expect(open).toHaveBeenCalledOnce();
    });

    it("closes after the close delay, and a return cancels it", () => {
        const open = vi.fn();
        const close = vi.fn();
        const intent = createHoverIntent({ open, close });
        intent.leave(0);
        expect(close).toHaveBeenCalledOnce();
        intent.leave(100);
        intent.enter(0);
        vi.advanceTimersByTime(200);
        expect(close).toHaveBeenCalledOnce();
        expect(open).toHaveBeenCalledOnce();
    });
});

describe("createDelayGroup", () => {
    it("reads a timeout getter at each check, keeping its open member", () => {
        let timeout = 400;
        const group = createDelayGroup({ timeout: () => timeout });
        const first = vi.fn();
        group.opened(first);
        timeout = 0;
        group.opened(() => {});
        expect(first).toHaveBeenCalledTimes(1);
        group.closed(first, 1000);
        expect(group.isInstant(1100)).toBe(true); // the second is still open
    });

    it("hands off within a timeout read when it checks", () => {
        let timeout = 400;
        const group = createDelayGroup({ timeout: () => timeout });
        const member = () => {};
        group.opened(member);
        group.closed(member, 1000);
        expect(group.isInstant(1300)).toBe(true);
        timeout = 100;
        expect(group.isInstant(1300)).toBe(false);
    });

    it("hands off instantly while open and within the timeout", () => {
        const group = createDelayGroup({ timeout: 400 });
        expect(group.isInstant(0)).toBe(false);
        const closeA = vi.fn();
        const closeB = vi.fn();
        group.opened(closeA);
        expect(group.isInstant(10)).toBe(true);
        group.opened(closeB);
        expect(closeA).toHaveBeenCalledOnce();
        // A reports its close after B opened: B stays the open member
        group.closed(closeA, 20);
        expect(group.isInstant(30)).toBe(true);
        group.closed(closeB, 1000);
        expect(group.isInstant(1300)).toBe(true);
        expect(group.isInstant(1401)).toBe(false);
    });
});
