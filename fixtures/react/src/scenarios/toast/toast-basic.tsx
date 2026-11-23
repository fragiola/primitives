import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toast } from "../../kit/ui/toast.tsx";
import { notifications } from "./toast-queue.ts";

/** spec/toast.md `/toast/basic`: the module's queue, and the Provider's through the hook. */
function Notifications() {
    const manager = Toast.useToastManager();
    const [closed, setClosed] = useState<string>();
    const [action, setAction] = useState<string>();
    const count = manager.toasts.filter((item) => !item.closing).length;
    return (
        <>
            <div className="flex gap-2">
                <button type="button">Before</button>
                <button
                    type="button"
                    onClick={() =>
                        notifications.add({
                            title: "Saved",
                            description: "Your draft was saved.",
                            onClose: () => setClosed("Saved"),
                        })
                    }
                >
                    Show toast
                </button>
                <button
                    type="button"
                    onClick={() =>
                        manager.add({
                            title: "Connection lost",
                            description: "Retrying in 5 seconds.",
                            priority: "high",
                            onClose: () => setClosed("Connection lost"),
                        })
                    }
                >
                    Show alert
                </button>
                <button type="button" onClick={() => manager.close()}>
                    Close all
                </button>
            </div>
            <Toast.Portal>
                <Toast.Viewport aria-label="Notifications">
                    {manager.toasts.map((item) => (
                        <Toast.Root key={item.id} toast={item}>
                            <Toast.Title />
                            <Toast.Description />
                            <Toast.Action
                                onClick={() => {
                                    setAction(item.title);
                                    manager.close(item.id);
                                }}
                            >
                                Undo
                            </Toast.Action>
                            <Toast.Close>Dismiss</Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
            <Output values={{ toasts: count, closed, action }} />
        </>
    );
}

export function ToastBasic() {
    return (
        <Toast.Provider toastManager={notifications}>
            <Notifications />
        </Toast.Provider>
    );
}
