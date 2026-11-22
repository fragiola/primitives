import type { OverlayActions } from "@fragiola/primitives-react/dialog";
import { useRef } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function DialogLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const actions = useRef<OverlayActions>(null);
    return (
        <>
            <Dialog.Root
                actionsRef={actions}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <Dialog.Trigger>Open dialog</Dialog.Trigger>
                <Dialog.Portal keepMounted>
                    <Dialog.Backdrop />
                    <Dialog.Popup>
                        <Dialog.Title>Lifecycle</Dialog.Title>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => actions.current?.close()}
                            >
                                Close with actions
                            </button>
                            <Dialog.Close>Close</Dialog.Close>
                        </div>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
