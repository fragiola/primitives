import type {
    OpenChangeDetails,
    OverlayActions,
} from "@fragiola/primitives-react/alert-dialog";
import { useRef, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { AlertDialog } from "../../kit/ui/alert-dialog.tsx";

/** spec/alert-dialog.md: a destructive confirmation, never dismissed from outside. */
export function AlertDialogBasic() {
    const actions = useRef<OverlayActions>(null);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [action, setAction] = useState<string>();
    return (
        <>
            <AlertDialog.Root
                actionsRef={actions}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                }}
            >
                <AlertDialog.Trigger>Discard draft</AlertDialog.Trigger>
                <AlertDialog.Portal>
                    <AlertDialog.Backdrop />
                    <AlertDialog.Popup>
                        <AlertDialog.Title>Discard draft?</AlertDialog.Title>
                        <AlertDialog.Description>
                            Your unsaved changes will be lost.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-2">
                            <AlertDialog.Action
                                onClick={() => {
                                    setAction("discard");
                                    actions.current?.close();
                                }}
                            >
                                Discard
                            </AlertDialog.Action>
                            <AlertDialog.Close>Cancel</AlertDialog.Close>
                        </div>
                    </AlertDialog.Popup>
                </AlertDialog.Portal>
            </AlertDialog.Root>
            <button type="button" className="ms-2">
                Outside button
            </button>
            <Output values={{ open, reason, action }} />
        </>
    );
}
