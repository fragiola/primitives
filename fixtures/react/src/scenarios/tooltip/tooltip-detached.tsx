import type { OpenChangeDetails } from "@fragiola/primitives-react/tooltip";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Tooltip } from "../../kit/ui/tooltip.tsx";

const PEOPLE = ["Ada", "Grace"];

/** One Tooltip describing two Triggers, each with a name as its payload. */
export function TooltipDetached() {
    const [handle] = useState(() => Tooltip.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    return (
        <>
            <div className="mt-12 flex gap-8">
                {PEOPLE.map((name) => (
                    <Tooltip.Trigger
                        key={name}
                        handle={handle}
                        payload={name}
                        id={`call-${name.toLowerCase()}`}
                    >
                        {`Call ${name}`}
                    </Tooltip.Trigger>
                ))}
            </div>
            <Tooltip.Root
                handle={handle}
                delay={300}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <Tooltip.Portal>
                        <Tooltip.Positioner sideOffset={6}>
                            <Tooltip.Popup>{`Opens a call with ${payload}`}</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                )}
            </Tooltip.Root>
            <Output values={{ open, reason, trigger }} />
        </>
    );
}
