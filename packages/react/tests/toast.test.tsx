import { createToastManager, Toast } from "@fragiola/primitives-react/toast";
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

function List() {
    const { toasts } = Toast.useToastManager();
    return (
        <Toast.Viewport aria-label="Notifications">
            {toasts.map((toast) => (
                <Toast.Root key={toast.id} toast={toast}>
                    <Toast.Title />
                    <Toast.Close>Dismiss</Toast.Close>
                </Toast.Root>
            ))}
        </Toast.Viewport>
    );
}

// spec/toast.md: a queue from a plain module renders through the Provider
describe("Toast", () => {
    it("renders the toasts of a module's queue and closes one with Close", () => {
        const queue = createToastManager({ timeout: 0 });
        render(
            <Toast.Provider toastManager={queue}>
                <List />
            </Toast.Provider>,
        );
        act(() => {
            queue.add({ title: "Saved" });
        });
        const dialog = screen.getByRole("dialog", { name: "Saved" });
        expect(dialog.dataset.primitivesPart).toBe("toast-root");
        fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
        // closed, and with no exit animation to wait for, out of the queue
        expect(queue.toasts().filter((toast) => !toast.closing)).toEqual([]);
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
