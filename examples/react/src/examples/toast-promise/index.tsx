import { Toast } from "@fragiola/primitives-react/toast";
import { styles } from "./styles.ts";

/** A pretend upload: it settles after 1.5 s, and fails for a file named "too-large.zip". */
function upload(name: string): Promise<{ name: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(
            () =>
                name === "too-large.zip"
                    ? reject(new Error("the file is over 10 MB"))
                    : resolve({ name }),
            1500,
        );
    });
}

function Uploads() {
    const manager = Toast.useToastManager();
    const start = (name: string) => {
        manager
            .promise(upload(name), {
                loading: {
                    title: `Uploading ${name}`,
                    description: "Please wait.",
                },
                success: (file) => ({
                    title: `${file.name} uploaded`,
                    description: "It is in your files.",
                }),
                error: (error) => ({
                    title: `Could not upload ${name}`,
                    description: (error as Error).message,
                }),
            })
            .catch(() => {});
    };
    return (
        <>
            <div className={styles.buttons}>
                <button
                    type="button"
                    className={styles.trigger}
                    onClick={() => start("report.pdf")}
                >
                    Upload report.pdf
                </button>
                <button
                    type="button"
                    className={styles.trigger}
                    onClick={() => start("too-large.zip")}
                >
                    Upload too-large.zip
                </button>
            </div>
            <Toast.Portal>
                <Toast.Viewport
                    aria-label="Notifications"
                    className={styles.viewport}
                >
                    {manager.toasts.map((item) => (
                        <Toast.Root
                            key={item.id}
                            toast={item}
                            className={styles.root}
                        >
                            <Toast.Title className={styles.title} />
                            <Toast.Description className={styles.description} />
                            <Toast.Close className={styles.close}>
                                Dismiss
                            </Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
        </>
    );
}

// A promise toast: "Uploading" while the upload runs (it never closes by itself meanwhile), then
// its result, announced and closed after the timeout.
export default function UploadProgress() {
    return (
        <Toast.Provider timeout={4000}>
            <Uploads />
        </Toast.Provider>
    );
}
