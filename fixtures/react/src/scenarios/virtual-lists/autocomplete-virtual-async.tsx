import { useAsyncList } from "@fragiola/primitives-react/async-list";
import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { AutocompleteVirtual } from "../../kit/ui/virtual-lists.tsx";
import { loadLabels } from "./items.ts";

/** An Autocomplete whose suggestions load for its text, page by page (spec/virtual-lists.md). */
export function AutocompleteVirtualAsync() {
    const id = useId();
    const list = useAsyncList({ load: loadLabels });
    const [value, setValue] = useState("");
    return (
        <>
            <Autocomplete.Root
                items={list.items}
                filter={null}
                value={value}
                onValueChange={(next: string) => {
                    setValue(next);
                    list.setFilterText(next);
                }}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Search
                    </label>
                    <Autocomplete.InputGroup>
                        <Autocomplete.Input id={id} />
                    </Autocomplete.InputGroup>
                    <Autocomplete.Status>
                        {list.loading ? "Loading…" : ""}
                    </Autocomplete.Status>
                </div>
                <Autocomplete.Portal>
                    <Autocomplete.Positioner sideOffset={4}>
                        <Autocomplete.Popup>
                            <AutocompleteVirtual.List
                                loading={list.loading}
                                onLoadMore={list.loadMore}
                            >
                                {(label: string) => (
                                    <Autocomplete.Item value={label}>
                                        {label}
                                    </Autocomplete.Item>
                                )}
                            </AutocompleteVirtual.List>
                        </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                </Autocomplete.Portal>
            </Autocomplete.Root>
            <Output
                values={{
                    count: list.items.length,
                    filter: list.loading ? undefined : list.filterText,
                    value,
                }}
            />
        </>
    );
}
