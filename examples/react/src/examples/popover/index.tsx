import { Popover } from "@fragiola/primitives-react/popover";
import { styles } from "./styles.ts";

// A "Notifications" popover: the trigger opens it under itself, focus moves to its first button,
// Tab walks it and leaves it closed, and Escape or a press outside closes it.
export default function Notifications() {
    return (
        <Popover.Root>
            <Popover.Trigger className={styles.trigger}>
                Notifications
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    sideOffset={8}
                    className={styles.positioner}
                >
                    <Popover.Popup className={styles.popup}>
                        <Popover.Arrow className={styles.arrow} />
                        <Popover.Title className={styles.title}>
                            Notifications
                        </Popover.Title>
                        <Popover.Description className={styles.description}>
                            You have 2 unread messages.
                        </Popover.Description>
                        <div className={styles.actions}>
                            <Popover.Close className={styles.close}>
                                Dismiss
                            </Popover.Close>
                            <Popover.Close className={styles.close}>
                                Mark all as read
                            </Popover.Close>
                        </div>
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}
