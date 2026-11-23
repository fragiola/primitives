import "@angular/compiler";
import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import { afterEach, describe, expect, it } from "vitest";

// Epic #58 (#57): the async list in signals (spec/virtual-lists.md, "The mechanisms"), from its
// public specifier.

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
afterEach(() => TestBed.resetTestingModule());

const requests: { signal: AbortSignal; filterText: string }[] = [];
const pending: ((page: { items: string[]; cursor: number | null }) => void)[] =
    [];

@Component({ selector: "test-async-list", template: "" })
class AsyncListHost {
    readonly list = injectAsyncList<string, number>({
        load: (request) => {
            requests.push(request);
            return new Promise((resolve) => pending.push(resolve));
        },
    });
}

describe("@fragiola/primitives-angular/async-list", () => {
    it("starts loading with no items, loads after the first render, and aborts when destroyed", async () => {
        requests.length = 0;
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(AsyncListHost);
        const { list } = fixture.componentInstance;
        expect(list.status()).toBe("loading");
        expect(list.loading()).toBe(true);
        expect(list.items()).toEqual([]);
        expect(requests).toEqual([]);
        TestBed.tick();
        expect(requests).toHaveLength(1);
        // the load in flight is a pending task: the application is stable once its page arrived
        let stable = false;
        const settled = fixture.whenStable().then(() => {
            stable = true;
        });
        await Promise.resolve();
        expect(stable).toBe(false);
        pending.shift()?.({ items: ["a", "b"], cursor: 1 });
        await settled;
        expect(list.items()).toEqual(["a", "b"]);
        expect(list.status()).toBe("idle");
        expect(list.hasMore()).toBe(true);
        list.loadMore();
        expect(list.status()).toBe("loading-more");
        expect(list.loading()).toBe(true);
        fixture.destroy();
        expect(requests[1]?.signal.aborted).toBe(true);
    });

    it("loads the first page of a filter text", async () => {
        requests.length = 0;
        pending.length = 0;
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(AsyncListHost);
        const { list } = fixture.componentInstance;
        TestBed.tick();
        list.setFilterText("x");
        expect(list.filterText()).toBe("x");
        expect(requests.at(-1)?.filterText).toBe("x");
        expect(requests[0]?.signal.aborted).toBe(true);
        pending.at(-1)?.({ items: ["x1"], cursor: null });
        await fixture.whenStable();
        expect(list.items()).toEqual(["x1"]);
        expect(list.hasMore()).toBe(false);
    });
});
