import { Toast } from "../../kit/ui/toast.tsx";

/** A save that settles 1 s later (on the page's clock). */
function save(fails: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        setTimeout(
            () => (fails ? reject(new Error("offline")) : resolve("ok")),
            1000,
        );
    });
}

/** spec/toast.md `/toast/promise`. */
function Notifications() {
    const manager = Toast.useToastManager();
    const run = (fails: boolean) => {
        manager
            .promise(save(fails), {
                loading: "Saving file",
                success: "File saved",
                error: (error) => `Could not save: ${(error as Error).message}`,
            })
            .catch(() => {});
    };
    return (
        <>
            <div className="flex gap-2">
                <button type="button" onClick={() => run(false)}>
                    Save file
                </button>
                <button type="button" onClick={() => run(true)}>
                    Save offline
                </button>
            </div>
            <Toast.Portal>
                <Toast.Viewport aria-label="Notifications">
                    {manager.toasts.map((item) => (
                        <Toast.Root key={item.id} toast={item}>
                            <Toast.Title />
                            <Toast.Close>Dismiss</Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
        </>
    );
}

export function ToastPromise() {
    return (
        <Toast.Provider timeout={2000}>
            <Notifications />
        </Toast.Provider>
    );
}
