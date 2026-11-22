import { Drawer } from "@fragiola/primitives-react/drawer";
import { useState } from "react";
import { styles } from "./styles.ts";

const TARGETS = ["Copy link", "Email", "Messages"];

// A share sheet: "Share" opens a bottom sheet that slides up; swipe it down (with a mouse, from
// its handle; with a touch, from anywhere), press Escape or choose a target to close it
// (spec/drawer.md).
export default function ShareSheet() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState("Not shared yet");
    return (
        <div className={styles.stack}>
            <Drawer.Root open={open} onOpenChange={setOpen}>
                <Drawer.Trigger className={styles.trigger}>
                    Share
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop className={styles.backdrop} />
                    <Drawer.Viewport className={styles.viewport}>
                        <Drawer.Popup className={styles.popup}>
                            <div aria-hidden="true" className={styles.handle} />
                            <Drawer.Content className={styles.content}>
                                <Drawer.Title className={styles.title}>
                                    Share
                                </Drawer.Title>
                                <Drawer.Description
                                    className={styles.description}
                                >
                                    Send this page to someone.
                                </Drawer.Description>
                                <div className={styles.targets}>
                                    {TARGETS.map((target) => (
                                        <button
                                            key={target}
                                            type="button"
                                            className={styles.target}
                                            onClick={() => {
                                                setStatus(`Shared: ${target}`);
                                                setOpen(false);
                                            }}
                                        >
                                            {target}
                                        </button>
                                    ))}
                                </div>
                                <Drawer.Close className={styles.close}>
                                    Cancel
                                </Drawer.Close>
                            </Drawer.Content>
                        </Drawer.Popup>
                    </Drawer.Viewport>
                </Drawer.Portal>
            </Drawer.Root>
            <p className={styles.status}>{status}</p>
        </div>
    );
}
