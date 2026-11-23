import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Combobox } from "../../kit/ui/combobox.tsx";
import { ComboboxVirtual } from "../../kit/ui/virtual-lists.tsx";
import { ITEMS, type VirtualItem } from "./items.ts";

/** A Combobox over the 10 000 items, with a ComboboxVirtual List (spec/virtual-lists.md). */
export function ComboboxVirtualBasic() {
    const id = useId();
    const [value, setValue] = useState<VirtualItem | null>(null);
    const [input, setInput] = useState("");
    return (
        <>
            <Combobox.Root
                items={ITEMS}
                value={value}
                onValueChange={(next: VirtualItem | null) => setValue(next)}
                onInputValueChange={(next: string) => setInput(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Item
                    </label>
                    <Combobox.InputGroup>
                        <Combobox.Input id={id} />
                    </Combobox.InputGroup>
                </div>
                <Combobox.Portal>
                    <Combobox.Positioner sideOffset={4}>
                        <Combobox.Popup>
                            <Combobox.Empty>No item found.</Combobox.Empty>
                            <ComboboxVirtual.List>
                                {(item: VirtualItem) => (
                                    <Combobox.Item
                                        value={item}
                                        disabled={item.disabled}
                                    >
                                        {item.label}
                                    </Combobox.Item>
                                )}
                            </ComboboxVirtual.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
            <Output values={{ value: value?.value, input }} />
        </>
    );
}
