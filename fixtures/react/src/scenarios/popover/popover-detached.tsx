import type { OpenChangeDetails } from "@fragiola/primitives-react/popover";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Popover } from "../../kit/ui/popover.tsx";

const PEOPLE = ["Ada", "Grace"];

/** One Popover opened from two Triggers, each with a name as its payload. */
export function PopoverDetached() {
    const [handle] = useState(() => Popover.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    return (
        <>
            <div className="flex gap-24">
                {PEOPLE.map((name) => (
                    <Popover.Trigger
                        key={name}
                        handle={handle}
                        payload={name}
                        id={`info-${name.toLowerCase()}`}
                    >
                        {`Info for ${name}`}
                    </Popover.Trigger>
                ))}
            </div>
            <Popover.Root
                handle={handle}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <Popover.Portal>
                        <Popover.Positioner sideOffset={4}>
                            <Popover.Popup>
                                <Popover.Title>{`About ${payload}`}</Popover.Title>
                                <Popover.Close>Close</Popover.Close>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                )}
            </Popover.Root>
            <Output values={{ open, reason, trigger }} />
        </>
    );
}
