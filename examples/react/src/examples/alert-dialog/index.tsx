import { AlertDialog } from "@fragiola/primitives-react/alert-dialog";
import { useState } from "react";
import { styles } from "./styles.ts";

// A draft with a "Discard draft" button: the alert dialog asks first, focus starts on "Keep
// editing" (the least destructive answer), a press outside does nothing, and "Discard" clears the
// draft and closes it (spec/alert-dialog.md).
export default function DiscardDraft() {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("Dear Ada, the engine is ready.");
    return (
        <div className={styles.stack}>
            <label className={styles.field}>
                Draft
                <textarea
                    className={styles.textarea}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                />
            </label>
            <AlertDialog.Root open={open} onOpenChange={setOpen}>
                <AlertDialog.Trigger
                    className={styles.trigger}
                    disabled={draft === ""}
                >
                    Discard draft
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                    <AlertDialog.Backdrop className={styles.backdrop} />
                    <AlertDialog.Popup className={styles.popup}>
                        <AlertDialog.Title className={styles.title}>
                            Discard draft?
                        </AlertDialog.Title>
                        <AlertDialog.Description className={styles.description}>
                            Your draft will be deleted. This cannot be undone.
                        </AlertDialog.Description>
                        <div className={styles.actions}>
                            <AlertDialog.Close className={styles.close}>
                                Keep editing
                            </AlertDialog.Close>
                            <button
                                type="button"
                                className={styles.action}
                                onClick={() => {
                                    setDraft("");
                                    setOpen(false);
                                }}
                            >
                                Discard
                            </button>
                        </div>
                    </AlertDialog.Popup>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </div>
    );
}
