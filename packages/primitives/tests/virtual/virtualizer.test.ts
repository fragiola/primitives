import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createVirtualizer,
    scrollContainer,
} from "../../src/virtual/virtualizer.ts";

/** A fake ResizeObserver on the window: the test reports sizes itself. */
class FakeObserver {
    static instances: FakeObserver[] = [];
    readonly targets = new Set<Element>();
    constructor(readonly callback: ResizeObserverCallback) {
        FakeObserver.instances.push(this);
    }
    observe(target: Element) {
        this.targets.add(target);
    }
    unobserve(target: Element) {
        this.targets.delete(target);
    }
    disconnect() {
        this.targets.clear();
    }
    resize(target: Element, blockSize: number) {
        this.callback(
            [
                {
                    target,
                    borderBoxSize: [{ blockSize, inlineSize: 100 }],
                } as unknown as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver,
        );
    }
}

/** A scrolling list of `height` px: the list scrolls itself (`overflow-y: auto`). */
function scrollingList(height: number) {
    const list = document.createElement("div");
    list.style.overflowY = "auto";
    document.body.append(list);
    let scrollTop = 0;
    Object.defineProperty(list, "clientHeight", {
        value: height,
        configurable: true,
    });
    Object.defineProperty(list, "scrollTop", {
        get: () => scrollTop,
        set: (value: number) => {
            scrollTop = value;
        },
    });
    const scroll = (to: number) => {
        scrollTop = to;
        list.dispatchEvent(new Event("scroll"));
    };
    return { list, scroll };
}

function row(height: number): HTMLElement {
    const element = document.createElement("div");
    Object.defineProperty(element, "offsetHeight", { value: height });
    return element;
}

afterEach(() => {
    document.body.replaceChildren();
    FakeObserver.instances = [];
    vi.unstubAllGlobals();
});

describe("createVirtualizer", () => {
    it("renders the overscan before it is attached, then the rows in view", () => {
        const onChange = vi.fn();
        const virtualizer = createVirtualizer({
            count: 10_000,
            estimateSize: 20,
            overscan: 2,
            onChange,
        });
        expect(virtualizer.range().rows.map((r) => r.index)).toEqual([0, 1, 2]);
        const { list, scroll } = scrollingList(100);
        const detach = virtualizer.attach(list);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(virtualizer.range().rows.map((r) => r.index)).toEqual([
            0, 1, 2, 3, 4, 5, 6,
        ]);
        scroll(2000);
        expect(onChange).toHaveBeenCalledTimes(2);
        const range = virtualizer.range();
        expect(range.visibleStart).toBe(100);
        expect(range.rows[0]).toMatchObject({ index: 98, spaceBefore: 1960 });
        // a scroll that renders the same rows renders nothing again
        scroll(2010);
        expect(onChange).toHaveBeenCalledTimes(3);
        scroll(2015);
        expect(onChange).toHaveBeenCalledTimes(3);
        detach();
        scroll(0);
        expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("scrolls to a row and renders it at once (scroll to index)", () => {
        const virtualizer = createVirtualizer({
            count: 10_000,
            estimateSize: 20,
            overscan: 0,
        });
        const { list } = scrollingList(100);
        virtualizer.attach(list);
        virtualizer.scrollToIndex(9_999);
        expect(list.scrollTop).toBe(200_000 - 100);
        expect(virtualizer.range().rows.at(-1)?.index).toBe(9_999);
        // already in view: no scroll
        virtualizer.scrollToIndex(9_997);
        expect(list.scrollTop).toBe(200_000 - 100);
        virtualizer.scrollToIndex(10, "start");
        expect(list.scrollTop).toBe(200);
        virtualizer.scrollToIndex(10, "center");
        expect(list.scrollTop).toBe(160);
        virtualizer.scrollToIndex(10, "end");
        expect(list.scrollTop).toBe(120);
        // auto, from below: the row's top at the view's top
        virtualizer.scrollToIndex(2);
        expect(list.scrollTop).toBe(40);
        virtualizer.scrollToIndex(-1);
        virtualizer.scrollToIndex(10_000);
        expect(list.scrollTop).toBe(40);
    });

    it("starts the range at a row asked before it is attached", () => {
        const virtualizer = createVirtualizer({
            count: 100,
            estimateSize: 20,
            overscan: 0,
        });
        virtualizer.scrollToIndex(50);
        expect(virtualizer.range().rows.map((r) => r.index)).toEqual([50]);
    });

    it("measures the rows as they render and when they resize (measured sizes)", () => {
        vi.stubGlobal("ResizeObserver", FakeObserver);
        const onChange = vi.fn();
        const virtualizer = createVirtualizer({
            count: 100,
            estimateSize: 20,
            overscan: 0,
            onChange,
        });
        const { list, scroll } = scrollingList(100);
        virtualizer.attach(list);
        const first = row(50);
        const cleanup = virtualizer.measure(0, first);
        expect(virtualizer.range().rows[1]).toMatchObject({
            index: 1,
            start: 50,
        });
        expect(virtualizer.range().totalSize).toBe(50 + 99 * 20);
        const observer = FakeObserver.instances[0] as FakeObserver;
        expect(observer.targets.has(first)).toBe(true);
        const calls = onChange.mock.calls.length;
        // resize: the rows after it move
        observer.resize(first, 80);
        expect(onChange.mock.calls.length).toBeGreaterThan(calls);
        expect(virtualizer.range().totalSize).toBe(80 + 99 * 20);
        // the measured size stays once the row is gone
        cleanup();
        expect(observer.targets.has(first)).toBe(false);
        scroll(1000);
        expect(virtualizer.range().rows[0]?.start).toBe(80 + 46 * 20);
    });

    it("follows the visible size when the container resizes", () => {
        vi.stubGlobal("ResizeObserver", FakeObserver);
        const virtualizer = createVirtualizer({
            count: 100,
            estimateSize: 20,
            overscan: 0,
        });
        const { list } = scrollingList(100);
        virtualizer.attach(list);
        expect(virtualizer.range().visibleEnd).toBe(4);
        Object.defineProperty(list, "clientHeight", { value: 200 });
        FakeObserver.instances[0]?.resize(list, 200);
        expect(virtualizer.range().visibleEnd).toBe(9);
    });

    it("reads the list's gap", () => {
        const virtualizer = createVirtualizer({
            count: 10,
            estimateSize: 20,
        });
        const { list } = scrollingList(100);
        list.style.rowGap = "4px";
        virtualizer.attach(list);
        expect(virtualizer.range().totalSize).toBe(10 * 20 + 9 * 4);
    });

    it("follows new options: the count and the pinned rows", () => {
        const onChange = vi.fn();
        const virtualizer = createVirtualizer({
            count: 100,
            estimateSize: 20,
            overscan: 0,
            onChange,
        });
        const { list } = scrollingList(40);
        virtualizer.attach(list);
        virtualizer.update({ pinned: [80] });
        expect(virtualizer.range().rows.map((r) => r.index)).toEqual([
            0, 1, 80,
        ]);
        virtualizer.update({ count: 50 });
        expect(virtualizer.range().totalSize).toBe(1000);
        expect(virtualizer.range().rows.map((r) => r.index)).toEqual([0, 1]);
        // an update is what the framework renders: it does not ask to render again
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(virtualizer.pageIndex(0, 1)).toBe(1);
    });

    it("finds the scroll container", () => {
        const outer = document.createElement("div");
        outer.style.overflowY = "scroll";
        const list = document.createElement("div");
        outer.append(list);
        document.body.append(outer);
        expect(scrollContainer(list)).toBe(outer);
        const alone = document.createElement("div");
        document.body.append(alone);
        expect(scrollContainer(alone)).toBe(alone);
    });
});

describe("createVirtualizer's scroll anchoring", () => {
    it("keeps the view still when a row above it changes size", () => {
        vi.stubGlobal("ResizeObserver", FakeObserver);
        const virtualizer = createVirtualizer({
            count: 100,
            estimateSize: 20,
            overscan: 2,
        });
        const { list, scroll } = scrollingList(100);
        virtualizer.attach(list);
        scroll(400);
        const above = row(20);
        virtualizer.measure(18, above);
        FakeObserver.instances[0]?.resize(above, 50);
        expect(list.scrollTop).toBe(430);
        // a row in view grows: no scroll
        const inView = row(20);
        virtualizer.measure(21, inView);
        FakeObserver.instances[0]?.resize(inView, 40);
        expect(list.scrollTop).toBe(430);
    });
});
