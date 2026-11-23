import type { ChangeDetails } from "@fragiola/primitives-react/hover-card";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { HoverCard } from "../../kit/ui/hover-card.tsx";

export function HoverCardBasic() {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <button type="button">Before</button>
            <p className="mt-4">
                {"Written by "}
                <HoverCard.Root
                    delay={500}
                    closeDelay={200}
                    open={open}
                    onOpenChange={(next: boolean, details: ChangeDetails) => {
                        setOpen(next);
                        setReason(details.reason);
                    }}
                >
                    <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
                    <HoverCard.Portal>
                        <HoverCard.Positioner sideOffset={8}>
                            <HoverCard.Popup>
                                <HoverCard.Arrow />
                                <strong>Ada Lovelace</strong>
                                <span>Mathematician and writer</span>
                                <a href="#ada-profile">View profile</a>
                            </HoverCard.Popup>
                        </HoverCard.Positioner>
                    </HoverCard.Portal>
                </HoverCard.Root>
            </p>
            <Output values={{ open, reason }} />
        </>
    );
}
