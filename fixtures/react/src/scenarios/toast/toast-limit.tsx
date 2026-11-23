import { useRef } from "react";
import { Toast } from "../../kit/ui/toast.tsx";

/** spec/toast.md `/toast/limit`. */
function Notifications() {
    const manager = Toast.useToastManager();
    const count = useRef(0);
    return (
        <>
            <button
                type="button"
                onClick={() => {
                    count.current += 1;
                    manager.add({
                        title: `Notification ${count.current}`,
                        description: `Message ${count.current}`,
                    });
                }}
            >
                Notify
            </button>
            <Toast.Portal>
                <Toast.Viewport aria-label="Notifications">
                    {manager.toasts.map((item) => (
                        <Toast.Root key={item.id} toast={item}>
                            <Toast.Title />
                            <Toast.Description />
                            <Toast.Close>Dismiss</Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
        </>
    );
}

export function ToastLimit() {
    return (
        <Toast.Provider limit={2} timeout={0}>
            <Notifications />
        </Toast.Provider>
    );
}
