import type { OpenChangeDetails } from "@fragiola/primitives-react/hover-card";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { HoverCard } from "../../kit/ui/hover-card.tsx";

const PEOPLE = ["Ada", "Grace"];

/** One HoverCard previewing two Triggers, each with a name as its payload. */
export function HoverCardDetached() {
    const [handle] = useState(() => HoverCard.createHandle<string>());
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [trigger, setTrigger] = useState<string>();
    return (
        <>
            <div className="flex gap-8">
                {PEOPLE.map((name) => (
                    <HoverCard.Trigger
                        key={name}
                        handle={handle}
                        payload={name}
                        id={name.toLowerCase()}
                        href={`#${name.toLowerCase()}`}
                    >
                        {`@${name.toLowerCase()}`}
                    </HoverCard.Trigger>
                ))}
            </div>
            <HoverCard.Root
                handle={handle}
                delay={300}
                onOpenChange={(next: boolean, details: OpenChangeDetails) => {
                    setOpen(next);
                    setReason(details.reason);
                    setTrigger(details.trigger?.id);
                }}
            >
                {({ payload }: { payload: string | undefined }) => (
                    <HoverCard.Portal>
                        <HoverCard.Backdrop />
                        <HoverCard.Positioner sideOffset={8}>
                            <HoverCard.Popup>{`Profile of ${payload}`}</HoverCard.Popup>
                        </HoverCard.Positioner>
                    </HoverCard.Portal>
                )}
            </HoverCard.Root>
            <Output values={{ open, reason, trigger }} />
        </>
    );
}
