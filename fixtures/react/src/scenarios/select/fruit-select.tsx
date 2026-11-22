import type { ChangeDetails } from "@fragiola/primitives-react/select";
import { Select } from "../../kit/ui/select.tsx";
import { FRUIT_ITEMS } from "./fruit-items.ts";

export interface FruitSelectProps {
    id: string;
    name?: string;
    required?: boolean;
    modal?: boolean;
    value?: string | null;
    onValueChange: (value: string | null) => void;
    onOpenChange?: (open: boolean, reason: string) => void;
}

/** The Select of the select scenarios. */
export function FruitSelect(props: FruitSelectProps) {
    return (
        <Select.Root
            items={FRUIT_ITEMS}
            name={props.name}
            required={props.required}
            modal={props.modal}
            value={props.value}
            onValueChange={(next: string | null) => props.onValueChange(next)}
            onOpenChange={(open: boolean, details: ChangeDetails) =>
                props.onOpenChange?.(open, details.reason)
            }
        >
            <Select.Trigger id={props.id}>
                <Select.Value placeholder="Choose a fruit" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Positioner>
                    <Select.Popup>
                        <Select.List>
                            {FRUIT_ITEMS.map((item) => (
                                <Select.Item
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                    <Select.ItemIndicator>
                                        ✓
                                    </Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}
