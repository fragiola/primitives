import type { ChangeDetails } from "@fragiola/primitives-react/accordion";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Accordion } from "../../kit/ui/accordion.tsx";
import { AccordionItems, ITEMS } from "./accordion-items.tsx";

const BASIC = [
    ITEMS[0],
    ITEMS[1],
    { value: "warranty", label: "Warranty", disabled: true },
    ITEMS[2],
].filter((item) => item !== undefined);

/** spec/accordion.md, `/accordion/basic` */
export function AccordionBasic() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Accordion.Root
                onValueChange={(next: string[], details: ChangeDetails) => {
                    setValue(next.join(","));
                    setReason(details.reason);
                }}
            >
                <AccordionItems items={BASIC} />
            </Accordion.Root>
            <button type="button" className="mt-2">
                After accordion
            </button>
            <Output values={{ value, reason }} />
        </>
    );
}
