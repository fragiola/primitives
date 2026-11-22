import type { OpenChangeDetails } from "@fragiola/primitives-react/dialog";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Dialog } from "../../kit/ui/dialog.tsx";

const PEOPLE = ["Ada", "Grace", "Alan"];

/** One Dialog opened from three rows, each Trigger with the row's name as its payload. */
export function DialogDetached() {
    const [handle] = useState(() => Dialog.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    return (
        <>
            <ul className="flex flex-col gap-2">
                {PEOPLE.map((name) => (
                    <li key={name} className="flex items-center gap-2">
                        <span className="w-16">{name}</span>
                        <Dialog.Trigger
                            handle={handle}
                            payload={name}
                            id={`edit-${name.toLowerCase()}`}
                        >
                            {`Edit ${name}`}
                        </Dialog.Trigger>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="mt-2"
                onClick={() => handle.open("edit-grace")}
            >
                Open for Grace
            </button>
            <Dialog.Root
                handle={handle}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <Dialog.Portal>
                        <Dialog.Backdrop />
                        <Dialog.Popup>
                            <Dialog.Title>{`Edit ${payload}`}</Dialog.Title>
                            <Dialog.Close>Close</Dialog.Close>
                        </Dialog.Popup>
                    </Dialog.Portal>
                )}
            </Dialog.Root>
            <Output values={{ open, reason, trigger }} />
        </>
    );
}
