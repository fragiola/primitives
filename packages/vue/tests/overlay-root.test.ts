import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { Dialog } from "../src/components/dialog/parts.ts";
import {
    type OverlayRoot,
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../src/composables/use-overlay-root.ts";
import type {
    OpenChangeDetails,
    OverlayActions,
} from "../src/utils/change-details.ts";

/** A Root of the composable alone, which hands its state to the test. */
function mountRoot(
    props: Record<string, unknown>,
    onOpenChange?: (open: boolean, details: OpenChangeDetails) => void,
) {
    let root: OverlayRoot | undefined;
    const Root = defineComponent({
        props: overlayRootProps,
        emits: overlayRootEmits,
        setup(rootProps, { emit, expose }) {
            root = useOverlayRoot(rootProps, emit);
            expose(root.actions);
            return () => null;
        },
    });
    const wrapper = mount(Root, { props: { ...props, onOpenChange } });
    if (root === undefined) {
        throw new Error("not mounted");
    }
    return { root, wrapper };
}

describe("useOverlayRoot", () => {
    it("reports the change before making it; a canceled change does not happen", () => {
        const seen: { open: boolean; details: OpenChangeDetails }[] = [];
        const { root, wrapper } = mountRoot({}, (open, details) => {
            seen.push({ open, details });
            if (!open) {
                details.cancel();
            }
        });
        const event = new MouseEvent("click");
        expect(root.setOpen(true, "trigger-press", event)).toBe(true);
        expect(root.open.value).toBe(true);
        expect(seen[0]?.details.reason).toBe("trigger-press");
        expect(seen[0]?.details.event).toBe(event);
        expect(seen[0]?.details.isCanceled).toBe(false);
        expect(root.setOpen(false, "escape-key")).toBe(false);
        expect(seen[1]?.details.isCanceled).toBe(true);
        // canceled: still open, no `update:open`, and the reason is not the canceled one's
        expect(root.open.value).toBe(true);
        expect(wrapper.emitted("update:open")).toEqual([[true]]);
        expect(root.lastReason.current).toBe("trigger-press");
    });

    it("does not report a change that changes nothing", () => {
        const seen: boolean[] = [];
        const { root } = mountRoot({}, (open) => seen.push(open));
        expect(root.setOpen(false, "escape-key")).toBe(false);
        expect(seen).toEqual([]);
    });

    it("exposes the actions: close is an imperative action", () => {
        const seen: OpenChangeDetails[] = [];
        const { root, wrapper } = mountRoot(
            { defaultOpen: true },
            (_, details) => seen.push(details),
        );
        (wrapper.vm as unknown as OverlayActions).close();
        expect(root.open.value).toBe(false);
        expect(seen[0]?.reason).toBe("imperative-action");
    });
});

describe("a dialog handle", () => {
    it("ignores its calls while no Root is attached", () => {
        const handle = Dialog.createHandle<string>();
        expect(handle.isOpen).toBe(false);
        expect(() => {
            handle.open("nobody");
            handle.openWithPayload("Ada");
            handle.close();
        }).not.toThrow();
        expect(handle.isOpen).toBe(false);
    });

    it("opens its Root from a detached trigger's id, with that trigger's payload", async () => {
        const handle = Dialog.createHandle<string>();
        const seen: OpenChangeDetails[] = [];
        const wrapper = mount(
            defineComponent({
                setup: () => () => [
                    h(
                        Dialog.Trigger,
                        { handle, payload: "Ada", id: "edit-ada" },
                        { default: () => "Edit Ada" },
                    ),
                    h(
                        Dialog.Root,
                        {
                            handle,
                            onOpenChange: (
                                _: boolean,
                                details: OpenChangeDetails,
                            ) => seen.push(details),
                        },
                        {
                            default: ({ payload }: { payload: unknown }) => [
                                h("output", `payload: ${payload}`),
                            ],
                        },
                    ),
                ],
            }),
            { attachTo: document.body },
        );
        await nextTick();
        handle.open("edit-ada");
        await nextTick();
        expect(handle.isOpen).toBe(true);
        expect(seen[0]?.reason).toBe("imperative-action");
        expect(seen[0]?.trigger?.id).toBe("edit-ada");
        expect(wrapper.get("output").text()).toBe("payload: Ada");
        expect(wrapper.get("button").attributes("aria-expanded")).toBe("true");
        handle.openWithPayload("Grace");
        await nextTick();
        expect(wrapper.get("output").text()).toBe("payload: Grace");
        handle.close();
        await nextTick();
        expect(handle.isOpen).toBe(false);
        wrapper.unmount();
    });
});
