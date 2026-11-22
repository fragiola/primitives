import type { OpenChangeDetails } from "@fragiola/primitives-react/select";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Select } from "../../kit/ui/select.tsx";

const FRUITS = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
];

const VEGETABLES = [
    { value: "carrot", label: "Carrot" },
    { value: "leek", label: "Leek", disabled: true },
    { value: "potato", label: "Potato" },
];

/** One Item: its ItemText, then its indicator. */
function FoodItem(props: { value: string; label: string; disabled?: boolean }) {
    return (
        <Select.Item value={props.value} disabled={props.disabled}>
            <Select.ItemText>{props.label}</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
        </Select.Item>
    );
}

/** spec/select.md: groups, a separator and item texts, with no `items` (the list kept mounted). */
export function SelectGroups() {
    const [value, setValue] = useState<string | null>("carrot");
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <label htmlFor="food" className="text-sm font-medium">
                    Food
                </label>
                <Select.Root
                    defaultValue="carrot"
                    onValueChange={(next: string | null) => setValue(next)}
                    onOpenChange={(
                        next: boolean,
                        details: OpenChangeDetails,
                    ) => {
                        setOpen(next);
                        setReason(details.reason);
                    }}
                >
                    <Select.Trigger id="food">
                        <Select.Value placeholder="Choose a food" />
                    </Select.Trigger>
                    <Select.Portal keepMounted>
                        <Select.Positioner>
                            <Select.Popup>
                                <Select.List>
                                    <Select.Group>
                                        <Select.GroupLabel>
                                            Fruits
                                        </Select.GroupLabel>
                                        {FRUITS.map((item) => (
                                            <FoodItem
                                                key={item.value}
                                                {...item}
                                            />
                                        ))}
                                    </Select.Group>
                                    <Select.Separator />
                                    <Select.Group>
                                        <Select.GroupLabel>
                                            Vegetables
                                        </Select.GroupLabel>
                                        {VEGETABLES.map((item) => (
                                            <FoodItem
                                                key={item.value}
                                                {...item}
                                            />
                                        ))}
                                    </Select.Group>
                                </Select.List>
                            </Select.Popup>
                        </Select.Positioner>
                    </Select.Portal>
                </Select.Root>
            </div>
            <Output values={{ value, open, reason }} />
        </>
    );
}
