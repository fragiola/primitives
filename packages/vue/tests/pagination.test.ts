import type { PaginationRangeItem } from "@fragiola/primitives-vue/pagination";
import { Pagination } from "@fragiola/primitives-vue/pagination";
import { ScrollArea } from "@fragiola/primitives-vue/scroll-area";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type Component, h, nextTick } from "vue";

let unmount: (() => void) | undefined;
afterEach(() => {
    unmount?.();
    unmount = undefined;
});

async function render(tree: () => ReturnType<typeof h>) {
    const wrapper = mount({ render: tree } as Component, {
        attachTo: document.body,
    });
    unmount = () => wrapper.unmount();
    await nextTick();
    return wrapper;
}

const button = (name: string) =>
    [...document.querySelectorAll<HTMLElement>("button")].find(
        (element) => element.textContent === name,
    ) as HTMLButtonElement;

// spec/pagination.md: the default scoped slot renders the range; a press reports its reason
describe("Pagination", () => {
    it("renders the range from its slot, and reports each press", async () => {
        const changes: [number, string][] = [];
        await render(() =>
            h(
                Pagination.Root,
                {
                    "aria-label": "Pages",
                    count: 10,
                    defaultPage: 5,
                    onPageChange: (page: number, details: { reason: string }) =>
                        changes.push([page, details.reason]),
                },
                {
                    default: ({ items }: { items: PaginationRangeItem[] }) => [
                        h(Pagination.Previous, null, () => "Previous"),
                        ...items.map((item) =>
                            item.type === "page"
                                ? h(
                                      Pagination.Item,
                                      { value: item.value },
                                      () => String(item.value),
                                  )
                                : h(Pagination.Ellipsis, null, () => "…"),
                        ),
                        h(Pagination.Next, null, () => "Next"),
                    ],
                },
            ),
        );
        expect(document.querySelector("nav")?.textContent).toBe(
            "Previous1…456…10Next",
        );
        expect(button("5").getAttribute("aria-current")).toBe("page");
        button("6").click();
        await nextTick();
        expect(button("6").getAttribute("aria-current")).toBe("page");
        button("Previous").click();
        await nextTick();
        // the current page reports nothing
        button("5").click();
        expect(changes).toEqual([
            [6, "item-press"],
            [5, "previous-press"],
        ]);
    });
});

// spec/scroll-area.md: on a server and before a measurement, no scrollbar is rendered
describe("ScrollArea", () => {
    it("renders no scrollbar while nothing overflows", async () => {
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            },
        );
        await render(() =>
            h(ScrollArea.Root, null, () => [
                h(ScrollArea.Viewport, null, () => [
                    h(ScrollArea.Content, null, () => "Text"),
                ]),
                h(ScrollArea.Scrollbar, null, () => [h(ScrollArea.Thumb)]),
            ]),
        );
        expect(
            document.querySelector(
                '[data-primitives-part="scroll-area-viewport"]',
            ),
        ).not.toBeNull();
        expect(
            document.querySelector(
                '[data-primitives-part="scroll-area-scrollbar"]',
            ),
        ).toBeNull();
        vi.unstubAllGlobals();
    });
});
