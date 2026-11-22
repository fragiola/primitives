import type { OpenChangeDetails } from "@fragiola/primitives-react/alert-dialog";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { AlertDialog } from "../../kit/ui/alert-dialog.tsx";

const PEOPLE = ["Ada", "Grace"];

/** One AlertDialog opened from two Triggers, each with a name as its payload. */
export function AlertDialogDetached() {
    const [handle] = useState(() => AlertDialog.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    return (
        <>
            <div className="flex gap-2">
                {PEOPLE.map((name) => (
                    <AlertDialog.Trigger
                        key={name}
                        handle={handle}
                        payload={name}
                        id={`delete-${name.toLowerCase()}`}
                    >
                        {`Delete ${name}`}
                    </AlertDialog.Trigger>
                ))}
            </div>
            <button
                type="button"
                className="mt-2"
                onClick={() => handle.open("delete-grace")}
            >
                Delete for Grace
            </button>
            <AlertDialog.Root
                handle={handle}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <AlertDialog.Portal>
                        <AlertDialog.Backdrop />
                        <AlertDialog.Viewport>
                            <AlertDialog.Popup>
                                <AlertDialog.Title>{`Delete ${payload}?`}</AlertDialog.Title>
                                <AlertDialog.Description>
                                    This cannot be undone.
                                </AlertDialog.Description>
                                <AlertDialog.Close>Cancel</AlertDialog.Close>
                            </AlertDialog.Popup>
                        </AlertDialog.Viewport>
                    </AlertDialog.Portal>
                )}
            </AlertDialog.Root>
            <Output values={{ open, reason, trigger }} />
        </>
    );
}
