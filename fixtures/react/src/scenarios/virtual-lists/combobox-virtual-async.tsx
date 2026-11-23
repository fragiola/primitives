import { useAsyncList } from "@fragiola/primitives-react/async-list";
import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Combobox } from "../../kit/ui/combobox.tsx";
import { ComboboxVirtual } from "../../kit/ui/virtual-lists.tsx";
import { loadItems, type VirtualItem } from "./items.ts";

/** A Combobox whose items load for its text, page by page (spec/virtual-lists.md). */
export function ComboboxVirtualAsync() {
    const id = useId();
    const list = useAsyncList({ load: loadItems });
    const [value, setValue] = useState<VirtualItem | null>(null);
    return (
        <>
            <Combobox.Root
                items={list.items}
                filter={null}
                value={value}
                onValueChange={(next: VirtualItem | null) => setValue(next)}
                onInputValueChange={(next: string) => list.setFilterText(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Item
                    </label>
                    <Combobox.InputGroup>
                        <Combobox.Input id={id} />
                    </Combobox.InputGroup>
                    <Combobox.Status>
                        {list.loading ? "Loading…" : ""}
                    </Combobox.Status>
                </div>
                <Combobox.Portal>
                    <Combobox.Positioner sideOffset={4}>
                        <Combobox.Popup>
                            <ComboboxVirtual.List
                                loading={list.loading}
                                onLoadMore={list.loadMore}
                            >
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
            <Output
                values={{
                    count: list.items.length,
                    filter: list.loading ? undefined : list.filterText,
                    value: value?.value,
                }}
            />
        </>
    );
}
