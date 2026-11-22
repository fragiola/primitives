import type { ChangeDetails } from "@fragiola/primitives-react/collapsible";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Collapsible } from "../../kit/ui/collapsible.tsx";

/** spec/collapsible.md, `/collapsible/hidden-until-found` */
export function CollapsibleHiddenUntilFound() {
    const [open, setOpen] = useState<boolean>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col gap-4">
                <Collapsible.Root
                    onOpenChange={(next: boolean, details: ChangeDetails) => {
                        setOpen(next);
                        setReason(details.reason);
                    }}
                >
                    <Collapsible.Trigger>Shipping details</Collapsible.Trigger>
                    <Collapsible.Panel hiddenUntilFound>
                        <p>Ships within two business days</p>
                    </Collapsible.Panel>
                </Collapsible.Root>
                <Collapsible.Root>
                    <Collapsible.Trigger>Return policy</Collapsible.Trigger>
                    <Collapsible.Panel keepMounted>
                        <p>Returns are free for thirty days</p>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </div>
            <Output values={{ open, reason }} />
        </>
    );
}
