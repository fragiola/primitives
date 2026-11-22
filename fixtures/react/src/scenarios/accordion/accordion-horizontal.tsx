import { Accordion } from "../../kit/ui/accordion.tsx";
import { AccordionItems, ITEMS } from "./accordion-items.tsx";

/** spec/accordion.md, `/accordion/horizontal` (and `?dir=rtl`) */
export function AccordionHorizontal() {
    return (
        <Accordion.Root orientation="horizontal" loopFocus={false}>
            <AccordionItems items={ITEMS} />
        </Accordion.Root>
    );
}
