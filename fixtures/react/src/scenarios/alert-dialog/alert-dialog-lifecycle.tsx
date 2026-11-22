import type { OverlayActions } from "@fragiola/primitives-react/alert-dialog";
import { useRef } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { AlertDialog } from "../../kit/ui/alert-dialog.tsx";

/** spec/README.md, "The lifecycle scenarios". */
export function AlertDialogLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const actions = useRef<OverlayActions>(null);
    return (
        <>
            <AlertDialog.Root
                actionsRef={actions}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
            >
                <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
                <AlertDialog.Portal keepMounted>
                    <AlertDialog.Backdrop />
                    <AlertDialog.Popup>
                        <AlertDialog.Title>Lifecycle</AlertDialog.Title>
                        <AlertDialog.Description>
                            Delete the file?
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => actions.current?.close()}
                            >
                                Close with actions
                            </button>
                            <AlertDialog.Close>Close</AlertDialog.Close>
                        </div>
                    </AlertDialog.Popup>
                </AlertDialog.Portal>
            </AlertDialog.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
