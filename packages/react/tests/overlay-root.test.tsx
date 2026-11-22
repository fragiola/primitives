import { act, cleanup, render, renderHook } from "@testing-library/react";
import { memo } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/components/dialog/parts.ts";
import { useOverlayRoot } from "../src/hooks/use-overlay-root.ts";
import type { OpenChangeDetails } from "../src/utils/change-details.ts";

afterEach(cleanup);

type StringHandle = ReturnType<typeof Dialog.createHandle<string>>;
type OnOpenChange = (open: boolean, details: OpenChangeDetails) => void;

function Row({ handle, payload }: { handle: StringHandle; payload: string }) {
    return (
        <Dialog.Trigger handle={handle} payload={payload} id="edit">
            Edit
        </Dialog.Trigger>
    );
}

function MovePage({
    handle,
    onOpenChange,
    second,
}: {
    handle: StringHandle;
    onOpenChange: OnOpenChange;
    second: boolean;
}) {
    return (
        <>
            <Dialog.Trigger handle={handle} payload="Ada" id="edit-ada">
                Edit Ada
            </Dialog.Trigger>
            {second ? (
                <Dialog.Trigger handle={handle} payload="Grace" id="edit-grace">
                    Edit Grace
                </Dialog.Trigger>
            ) : null}
            <Dialog.Root handle={handle} onOpenChange={onOpenChange}>
                {({ payload }) => <output>{`payload: ${payload}`}</output>}
            </Dialog.Root>
        </>
    );
}

// rendered again only when its own props change: the first Root alone renders again
const SecondRoot = memo(function SecondRoot({
    handle,
    onOpenChange,
}: {
    handle: StringHandle;
    onOpenChange: OnOpenChange;
}) {
    return <Dialog.Root handle={handle} onOpenChange={onOpenChange} />;
});

function TwoRoots({
    handle,
    first,
    second,
    firstOpen,
    withSecond,
}: {
    handle: StringHandle;
    first: OnOpenChange;
    second: OnOpenChange;
    firstOpen: boolean;
    withSecond: boolean;
}) {
    return (
        <>
            <Dialog.Root
                handle={handle}
                open={firstOpen}
                onOpenChange={first}
            />
            {withSecond ? (
                <SecondRoot handle={handle} onOpenChange={second} />
            ) : null}
        </>
    );
}

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

    it("renders the Root again when the active trigger's payload changes", () => {
        const handle = Dialog.createHandle<string>();
        // only the Trigger renders again: the Root element is the same object
        const root = (
            <Dialog.Root handle={handle}>
                {({ payload }) => <output>{`payload: ${payload}`}</output>}
            </Dialog.Root>
        );
        const view = render(
            <>
                <Row handle={handle} payload="Ada" />
                {root}
            </>,
        );
        act(() => handle.open("edit"));
        expect(view.getByText("payload: Ada")).toBeTruthy();
        view.rerender(
            <>
                <Row handle={handle} payload="Grace" />
                {root}
            </>,
        );
        expect(view.getByText("payload: Grace")).toBeTruthy();
    });

    it("moves to a trigger not rendered yet when opened on another one", () => {
        const handle = Dialog.createHandle<string>();
        const onOpenChange = vi.fn();
        const view = render(
            <MovePage
                handle={handle}
                onOpenChange={onOpenChange}
                second={false}
            />,
        );
        act(() => handle.open("edit-ada"));
        expect(view.getByText("payload: Ada")).toBeTruthy();
        act(() => handle.open("edit-grace"));
        expect(onOpenChange).toHaveBeenCalledTimes(2);
        const details = onOpenChange.mock.calls[1]?.[1] as OpenChangeDetails;
        expect(onOpenChange.mock.calls[1]?.[0]).toBe(true);
        expect(details.reason).toBe("imperative-action");
        expect(details.trigger).toBeUndefined();
        // the same id again is no move
        act(() => handle.open("edit-grace"));
        expect(onOpenChange).toHaveBeenCalledTimes(2);
        view.rerender(
            <MovePage handle={handle} onOpenChange={onOpenChange} second />,
        );
        expect(view.getByText("payload: Grace")).toBeTruthy();
        expect(
            view
                .getByRole("button", { name: "Edit Grace" })
                .getAttribute("aria-expanded"),
        ).toBe("true");
        expect(
            view
                .getByRole("button", { name: "Edit Ada" })
                .getAttribute("aria-expanded"),
        ).toBe("false");
    });

    it("serves the newest attached Root, and gives the handle back on detach", () => {
        const handle = Dialog.createHandle<string>();
        const first = vi.fn();
        const second = vi.fn();
        const warn = vi.spyOn(console, "warn");
        const error = vi.spyOn(console, "error");
        const view = render(
            <TwoRoots
                handle={handle}
                first={first}
                second={second}
                firstOpen={false}
                withSecond
            />,
        );
        act(() => handle.open(null));
        expect(second).toHaveBeenCalledTimes(1);
        expect(handle.isOpen).toBe(true);
        act(() => handle.close());
        expect(second).toHaveBeenCalledTimes(2);
        expect(handle.isOpen).toBe(false);
        // the first Root's context changing does not take the handle back from the second
        view.rerender(
            <TwoRoots
                handle={handle}
                first={first}
                second={second}
                firstOpen
                withSecond
            />,
        );
        expect(handle.isOpen).toBe(false);
        act(() => handle.open(null));
        expect(second).toHaveBeenCalledTimes(3);
        expect(first).not.toHaveBeenCalled();
        // the second one unmounted: the first serves the handle again
        view.rerender(
            <TwoRoots
                handle={handle}
                first={first}
                second={second}
                firstOpen
                withSecond={false}
            />,
        );
        expect(handle.isOpen).toBe(true);
        act(() => handle.close());
        expect(first).toHaveBeenCalledTimes(1);
        expect(first.mock.calls[0]?.[0]).toBe(false);
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        warn.mockRestore();
        error.mockRestore();
    });
});
