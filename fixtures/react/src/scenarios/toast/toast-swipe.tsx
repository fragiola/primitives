import { Output } from "../../kit/output.tsx";
import { Toast } from "../../kit/ui/toast.tsx";

/** spec/toast.md `/toast/swipe`. */
function Notifications() {
    const manager = Toast.useToastManager();
    const count = manager.toasts.filter((item) => !item.closing).length;
    return (
        <>
            <button
                type="button"
                onClick={() =>
                    manager.add({
                        title: "Swipe me",
                        description: "Drag to dismiss",
                    })
                }
            >
                Notify
            </button>
            <Toast.Portal>
                <Toast.Viewport aria-label="Notifications">
                    {manager.toasts.map((item) => (
                        <Toast.Root
                            key={item.id}
                            toast={item}
                            swipeDirection="right"
                        >
                            <Toast.Title />
                            <Toast.Description />
                            <Toast.Close>Dismiss</Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
            <Output values={{ toasts: count }} />
        </>
    );
}

export function ToastSwipe() {
    return (
        <Toast.Provider timeout={0}>
            <Notifications />
        </Toast.Provider>
    );
}
