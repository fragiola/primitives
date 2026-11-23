import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Select } from "../../kit/ui/select.tsx";
import { SelectVirtual } from "../../kit/ui/virtual-lists.tsx";
import { ITEMS } from "./items.ts";

/** A Select over the 10 000 items, with a SelectVirtual List (spec/virtual-lists.md). */
export function SelectVirtualBasic() {
    const [value, setValue] = useState<string | null>(null);
    return (
        <>
            <Select.Root
                items={ITEMS}
                value={value}
                onValueChange={(next: string | null) => setValue(next)}
            >
                <Select.Trigger aria-label="Item">
                    <Select.Value placeholder="Choose an item" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner>
                        <Select.Popup>
                            <SelectVirtual.List>
                                {(item) => (
                                    <Select.Item value={item.value}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </SelectVirtual.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
            <Output values={{ value }} />
        </>
    );
}
