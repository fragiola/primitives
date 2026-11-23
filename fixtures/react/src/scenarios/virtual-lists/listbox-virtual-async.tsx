import { useAsyncList } from "@fragiola/primitives-react/async-list";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxVirtual } from "../../kit/ui/virtual-lists.tsx";
import { loadItems } from "./items.ts";

/** A ListboxVirtual loading its pages as it scrolls (spec/virtual-lists.md). */
export function ListboxVirtualAsync() {
    const list = useAsyncList({ load: loadItems });
    return (
        <>
            <ListboxVirtual.Root
                aria-label="Items"
                items={list.items}
                loading={list.loading}
                onLoadMore={list.loadMore}
            >
                {(item) => (
                    <Listbox.Item value={item.value} disabled={item.disabled}>
                        {item.label}
                    </Listbox.Item>
                )}
            </ListboxVirtual.Root>
            <Output
                values={{ count: list.items.length, status: list.status }}
            />
        </>
    );
}
