import { useAsyncList } from "@fragiola/primitives-react/async-list";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Select } from "../../kit/ui/select.tsx";
import { SelectVirtual } from "../../kit/ui/virtual-lists.tsx";
import { loadItems } from "./items.ts";

/** A Select whose items load page by page (spec/virtual-lists.md). */
export function SelectVirtualAsync() {
    const list = useAsyncList({ load: loadItems });
    const [value, setValue] = useState<string | null>(null);
    return (
        <>
            <Select.Root
                items={list.items}
                value={value}
                onValueChange={(next: string | null) => setValue(next)}
            >
                <Select.Trigger aria-label="Item">
                    <Select.Value placeholder="Choose an item" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner>
                        <Select.Popup>
                            <SelectVirtual.List
                                loading={list.loading}
                                onLoadMore={list.loadMore}
                            >
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
            <Output values={{ count: list.items.length, value }} />
        </>
    );
}
