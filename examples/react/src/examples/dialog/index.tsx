import { Dialog } from "@fragiola/primitives-react/dialog";
import { styles } from "./styles.ts";

// An "Edit profile" dialog: the trigger opens it, focus moves to the first field, Tab stays
// inside, and Escape, a press outside or either button closes it, focus back on the trigger.
export default function EditProfile() {
    return (
        <Dialog.Root>
            <Dialog.Trigger className={styles.trigger}>
                Edit profile
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.backdrop} />
                <Dialog.Popup className={styles.popup}>
                    <Dialog.Title className={styles.title}>
                        Edit profile
                    </Dialog.Title>
                    <Dialog.Description className={styles.description}>
                        Change how others see you. Save when you are done.
                    </Dialog.Description>
                    <div className={styles.form}>
                        <label className={styles.field}>
                            Name
                            <input
                                className={styles.input}
                                defaultValue="Ada Lovelace"
                            />
                        </label>
                        <label className={styles.field}>
                            Username
                            <input
                                className={styles.input}
                                defaultValue="ada"
                            />
                        </label>
                    </div>
                    <div className={styles.actions}>
                        <Dialog.Close className={styles.close}>
                            Cancel
                        </Dialog.Close>
                        <Dialog.Close className={styles.close}>
                            Save
                        </Dialog.Close>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
