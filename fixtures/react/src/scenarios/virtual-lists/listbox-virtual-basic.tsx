import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxVirtual } from "../../kit/ui/virtual-lists.tsx";
import { ITEMS } from "./items.ts";

/** A multiple ListboxVirtual over the 10 000 items (spec/virtual-lists.md). */
export function ListboxVirtualBasic() {
    const [value, setValue] = useState<readonly string[]>([]);
    return (
        <>
            <ListboxVirtual.Root
                multiple
                aria-label="Items"
                items={ITEMS}
                value={value}
                onValueChange={(next: string[]) => setValue(next)}
            >
                {(item) => (
                    <Listbox.Item value={item.value} disabled={item.disabled}>
                        {item.label}
                    </Listbox.Item>
                )}
            </ListboxVirtual.Root>
            <Output values={{ count: value.length, last: value.at(-1) }} />
        </>
    );
}
