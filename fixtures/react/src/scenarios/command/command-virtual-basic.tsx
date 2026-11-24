import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command, CommandVirtual } from "../../kit/ui/command.tsx";
import { ITEMS } from "../virtual-lists/items.ts";

const ENTRIES = ITEMS.map((item) => ({
    value: item.label,
    disabled: item.disabled,
}));

/** spec/command.md, `/command-virtual/basic`: 10 000 Items, only those in view rendered. */
export function CommandVirtualBasic() {
    const [ran, setRan] = useState<string>();
    return (
        <>
            <Command.Root>
                <Command.Input aria-label="Command" />
                <Command.Empty>No results.</Command.Empty>
                <CommandVirtual.List items={ENTRIES} itemSize={36}>
                    {(entry) => (
                        <Command.Item
                            value={entry.value}
                            disabled={entry.disabled}
                            onSelect={setRan}
                        >
                            {entry.value}
                        </Command.Item>
                    )}
                </CommandVirtual.List>
            </Command.Root>
            <Output values={{ ran }} />
        </>
    );
}
