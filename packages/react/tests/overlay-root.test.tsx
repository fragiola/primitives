import { act, cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/components/dialog/parts.ts";
import { useOverlayRoot } from "../src/hooks/use-overlay-root.ts";
import type { OpenChangeDetails } from "../src/utils/change-details.ts";

afterEach(cleanup);

describe("useOverlayRoot", () => {
    it("reports the change before making it; a canceled change does not happen", () => {
        const seen: { open: boolean; details: OpenChangeDetails }[] = [];
        const { result } = renderHook(() =>
            useOverlayRoot({
                onOpenChange: (open, details) => {
                    seen.push({ open, details });
                    if (!open) {
                        details.cancel();
                    }
                },
            }),
        );
        const event = new MouseEvent("click");
        let changed = false;
        act(() => {
            changed = result.current.setOpen(true, "trigger-press", event);
        });
        expect(changed).toBe(true);
        expect(result.current.open).toBe(true);
        expect(seen[0]?.details.reason).toBe("trigger-press");
        expect(seen[0]?.details.event).toBe(event);
        expect(seen[0]?.details.isCanceled).toBe(false);
        act(() => {
            changed = result.current.setOpen(false, "escape-key");
        });
        expect(changed).toBe(false);
        expect(seen[1]?.details.isCanceled).toBe(true);
        // canceled: still open, and the reason is not the canceled one's
        expect(result.current.open).toBe(true);
        expect(result.current.lastReason.current).toBe("trigger-press");
    });

    it("does not report a change that changes nothing", () => {
        const onOpenChange = vi.fn();
        const { result } = renderHook(() => useOverlayRoot({ onOpenChange }));
        act(() => {
            result.current.setOpen(false, "escape-key");
        });
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("gives the actions: close is an imperative action", () => {
        const onOpenChange = vi.fn();
        const actionsRef = { current: null } as {
            current: { close: () => void; unmount: () => void } | null;
        };
        const { result } = renderHook(() =>
            useOverlayRoot({ defaultOpen: true, onOpenChange, actionsRef }),
        );
        expect(actionsRef.current).not.toBeNull();
        act(() => actionsRef.current?.close());
        expect(result.current.open).toBe(false);
        expect(onOpenChange.mock.calls[0]?.[1].reason).toBe(
            "imperative-action",
        );
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

    it("opens its Root from a detached trigger's id, with that trigger's payload", () => {
        const handle = Dialog.createHandle<string>();
        const onOpenChange = vi.fn();
        const view = render(
            <>
                <Dialog.Trigger handle={handle} payload="Ada" id="edit-ada">
                    Edit Ada
                </Dialog.Trigger>
                <Dialog.Root handle={handle} onOpenChange={onOpenChange}>
                    {({ payload }) => <output>{`payload: ${payload}`}</output>}
                </Dialog.Root>
            </>,
        );
        act(() => handle.open("edit-ada"));
        expect(handle.isOpen).toBe(true);
        const details = onOpenChange.mock.calls[0]?.[1] as OpenChangeDetails;
        expect(details.reason).toBe("imperative-action");
        expect(details.trigger?.id).toBe("edit-ada");
        expect(view.getByText("payload: Ada")).toBeTruthy();
        const trigger = view.getByRole("button", { name: "Edit Ada" });
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        act(() => handle.openWithPayload("Grace"));
        expect(view.getByText("payload: Grace")).toBeTruthy();
        act(() => handle.close());
        expect(handle.isOpen).toBe(false);
    });
});
