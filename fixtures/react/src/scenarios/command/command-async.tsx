import { useAsyncList } from "@fragiola/primitives-react/async-list";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command } from "../../kit/ui/command.tsx";
import { loadLabels } from "../virtual-lists/items.ts";

/** spec/command.md, `/command/async`: the results load for the text, filtered by the loader. */
export function CommandAsync() {
    const list = useAsyncList({ load: loadLabels });
    const [text, setText] = useState("");
    return (
        <>
            <Command.Root
                filter={null}
                loading={list.loading}
                inputValue={text}
                onInputValueChange={(value: string) => {
                    setText(value);
                    list.setFilterText(value);
                }}
            >
                <Command.Input aria-label="Command" />
                <Command.Loading>Loading…</Command.Loading>
                <Command.Empty>No results.</Command.Empty>
                <Command.List>
                    {list.items.map((label) => (
                        <Command.Item key={label} value={label}>
                            {label}
                        </Command.Item>
                    ))}
                </Command.List>
            </Command.Root>
            <Output
                values={{
                    count: list.items.length,
                    filter: list.loading ? undefined : list.filterText,
                }}
            />
        </>
    );
}
