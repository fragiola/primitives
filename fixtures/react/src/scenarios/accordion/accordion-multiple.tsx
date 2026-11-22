import type { ChangeDetails } from "@fragiola/primitives-react/accordion";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Accordion } from "../../kit/ui/accordion.tsx";
import { AccordionItems, ITEMS } from "./accordion-items.tsx";

/** spec/accordion.md, `/accordion/multiple` */
export function AccordionMultiple() {
    const [value, setValue] = useState(["shipping"]);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Accordion.Root
                multiple
                value={value}
                onValueChange={(next: string[], details: ChangeDetails) => {
                    setValue(next);
                    setReason(details.reason);
                }}
            >
                <AccordionItems items={ITEMS} hiddenUntilFound />
            </Accordion.Root>
            <Output values={{ value: value.join(","), reason }} />
        </>
    );
}
