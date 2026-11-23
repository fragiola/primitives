import { createToastManager, Toast } from "@fragiola/primitives-react/toast";
import { styles } from "./styles.ts";

// The app's notifications: a plain module could hold this queue and add to it from anywhere.
const notifications = createToastManager({ limit: 3 });

let sent = 0;

function sendMessage() {
    sent += 1;
    notifications.add({
        title: `Message ${sent} sent`,
        description: "Delivered to the team channel.",
    });
}

function warnOffline() {
    notifications.add({
        title: "You are offline",
        description: "Changes will sync when you reconnect.",
        priority: "high",
        timeout: 8000,
    });
}

function Toasts() {
    const { toasts, close } = Toast.useToastManager();
    return toasts.map((item) => (
        <Toast.Root key={item.id} toast={item} className={styles.root}>
            <Toast.Title className={styles.title} />
            <Toast.Description className={styles.description} />
            {item.priority === "low" && (
                <Toast.Action
                    className={styles.action}
                    onClick={() => close(item.id)}
                >
                    Undo
                </Toast.Action>
            )}
            <Toast.Close className={styles.close}>Dismiss</Toast.Close>
        </Toast.Root>
    ));
}

// A stack of notifications: they close after five seconds (paused while hovered or focused), the
// older ones peek behind the newest, F6 reaches them, and a swipe to the right dismisses one.
export default function NotificationStack() {
    return (
        <Toast.Provider toastManager={notifications}>
            <div className={styles.buttons}>
                <button
                    type="button"
                    className={styles.trigger}
                    onClick={sendMessage}
                >
                    Send message
                </button>
                <button
                    type="button"
                    className={styles.trigger}
                    onClick={warnOffline}
                >
                    Go offline
                </button>
            </div>
            <Toast.Portal>
                <Toast.Viewport
                    aria-label="Notifications"
                    className={styles.viewport}
                >
                    <Toasts />
                </Toast.Viewport>
            </Toast.Portal>
        </Toast.Provider>
    );
}
