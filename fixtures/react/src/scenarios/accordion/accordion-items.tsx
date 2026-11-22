import { Accordion } from "../../kit/ui/accordion.tsx";

export interface Item {
    value: string;
    label: string;
    disabled?: boolean;
}

export const ITEMS: Item[] = [
    { value: "shipping", label: "Shipping" },
    { value: "returns", label: "Returns" },
    { value: "support", label: "Support" },
];

/** The items of every accordion scenario (spec/accordion.md): a Header, a Trigger, a Panel. */
export function AccordionItems({
    items,
    hiddenUntilFound = false,
}: {
    items: Item[];
    hiddenUntilFound?: boolean;
}) {
    return items.map((item) => (
        <Accordion.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
        >
            <Accordion.Header>
                <Accordion.Trigger>{item.label}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel hiddenUntilFound={hiddenUntilFound}>
                <p>{item.label} details</p>
            </Accordion.Panel>
        </Accordion.Item>
    ));
}
