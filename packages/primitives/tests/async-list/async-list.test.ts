import { describe, expect, it, vi } from "vitest";
import {
    type AsyncListPage,
    type AsyncListRequest,
    createAsyncList,
} from "../../src/async-list/async-list.ts";

/** A loader whose calls the test resolves itself, in any order. */
function controlledLoader() {
    const calls: {
        request: AsyncListRequest<number>;
        resolve: (page: AsyncListPage<string, number>) => void;
        reject: (error: unknown) => void;
    }[] = [];
    const load = vi.fn(
        (request: AsyncListRequest<number>) =>
            new Promise<AsyncListPage<string, number>>((resolve, reject) => {
                calls.push({ request, resolve, reject });
            }),
    );
    return { calls, load };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createAsyncList", () => {
    it("loads the first page, then the next ones with the cursor", async () => {
        const { calls, load } = controlledLoader();
        const changes: string[] = [];
        const list = createAsyncList({
            load,
            onChange: (state) => changes.push(state.status),
        });
        expect(list.state()).toMatchObject({ items: [], status: "idle" });
        list.reload();
        expect(list.state().status).toBe("loading");
        expect(calls[0]?.request).toMatchObject({
            filterText: "",
            cursor: undefined,
        });
        calls[0]?.resolve({ items: ["a", "b"], cursor: 2 });
        await flush();
        expect(list.state()).toMatchObject({
            items: ["a", "b"],
            status: "idle",
            hasMore: true,
        });
        list.loadMore();
        expect(list.state().status).toBe("loading-more");
        // a second load more while one loads asks nothing
        list.loadMore();
        expect(load).toHaveBeenCalledTimes(2);
        expect(calls[1]?.request.cursor).toBe(2);
        calls[1]?.resolve({ items: ["c"] });
        await flush();
        expect(list.state()).toMatchObject({
            items: ["a", "b", "c"],
            hasMore: false,
        });
        // no cursor: no next page
        list.loadMore();
        expect(load).toHaveBeenCalledTimes(2);
        expect(changes).toEqual(["loading", "idle", "loading-more", "idle"]);
    });

    it("sends the filter text, keeps the items until its page arrives, and never shows a stale page", async () => {
        const { calls, load } = controlledLoader();
        const list = createAsyncList({ load, filterText: "a" });
        list.reload();
        calls[0]?.resolve({ items: ["apple", "avocado"] });
        await flush();
        list.setFilterText("ap");
        list.setFilterText("apr");
        expect(calls[1]?.request.signal.aborted).toBe(true);
        expect(calls[2]?.request).toMatchObject({ filterText: "apr" });
        expect(list.state()).toMatchObject({
            items: ["apple", "avocado"],
            filterText: "apr",
            status: "loading",
        });
        // the newer page arrives first, then the stale one
        calls[2]?.resolve({ items: ["apricot"] });
        calls[1]?.resolve({ items: ["apple"] });
        await flush();
        expect(list.state()).toMatchObject({
            items: ["apricot"],
            status: "idle",
        });
    });

    it("aborts a stale load more when the text changes", async () => {
        const { calls, load } = controlledLoader();
        const list = createAsyncList({ load });
        list.reload();
        calls[0]?.resolve({ items: ["a"], cursor: 1 });
        await flush();
        list.loadMore();
        list.setFilterText("b");
        expect(calls[1]?.request.signal.aborted).toBe(true);
        calls[1]?.resolve({ items: ["stale"] });
        calls[2]?.resolve({ items: ["b"] });
        await flush();
        expect(list.state().items).toEqual(["b"]);
    });

    it("keeps the error of a failed load, and loads again", async () => {
        const { calls, load } = controlledLoader();
        const list = createAsyncList({ load });
        list.reload();
        const error = new Error("offline");
        calls[0]?.reject(error);
        await flush();
        expect(list.state()).toMatchObject({ status: "error", error });
        list.reload();
        expect(list.state()).toMatchObject({
            status: "loading",
            error: undefined,
        });
        calls[1]?.resolve({ items: ["a"] });
        await flush();
        expect(list.state()).toMatchObject({ status: "idle", items: ["a"] });
    });

    it("turns a loader that throws into the error state", async () => {
        const list = createAsyncList<string>({
            load: () => {
                throw new Error("bad");
            },
        });
        list.reload();
        await flush();
        expect(list.state().status).toBe("error");
    });

    it("ignores an aborted load's rejection, and abort goes back to idle", async () => {
        const { calls, load } = controlledLoader();
        const list = createAsyncList({ load });
        list.reload();
        list.abort();
        expect(calls[0]?.request.signal.aborted).toBe(true);
        expect(list.state().status).toBe("idle");
        calls[0]?.reject(new DOMException("aborted", "AbortError"));
        await flush();
        expect(list.state().status).toBe("idle");
        // nothing in flight: nothing to abort
        const changes = vi.fn();
        const other = createAsyncList({ load, onChange: changes });
        other.abort();
        expect(changes).not.toHaveBeenCalled();
    });
});
