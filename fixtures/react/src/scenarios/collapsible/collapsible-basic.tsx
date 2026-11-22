import type { ChangeDetails } from "@fragiola/primitives-react/collapsible";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Collapsible } from "../../kit/ui/collapsible.tsx";

/** spec/collapsible.md, `/collapsible/basic` */
export function CollapsibleBasic() {
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
                    <Collapsible.Trigger>Recovery keys</Collapsible.Trigger>
                    <Collapsible.Panel>
                        <p>alpha-1234</p>
                        <p>beta-5678</p>
                    </Collapsible.Panel>
                </Collapsible.Root>
                <Collapsible.Root defaultOpen disabled>
                    <Collapsible.Trigger>Archived keys</Collapsible.Trigger>
                    <Collapsible.Panel>
                        <p>gamma-9012</p>
                    </Collapsible.Panel>
                </Collapsible.Root>
            </div>
            <button type="button" className="mt-2">
                After collapsible
            </button>
            <Output values={{ open, reason }} />
        </>
    );
}
