import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command } from "../../kit/ui/command.tsx";
import { CommandItems } from "./command-items.tsx";

/** A value or keyword starting with the text, case ignored. */
function startsWith(
    value: string,
    search: string,
    keywords: readonly string[],
): number {
    const query = search.toLowerCase();
    return [value, ...keywords].some((text) =>
        text.toLowerCase().startsWith(query),
    )
        ? 1
        : 0;
}

/** spec/command.md, `/command/filter` */
export function CommandFilter() {
    const [ran, setRan] = useState<string>();
    return (
        <>
            <Command.Root filter={startsWith}>
                <Command.Input aria-label="Command" />
                <Command.Empty>No results.</Command.Empty>
                <Command.List>
                    <CommandItems onRun={setRan} />
                    <Command.Item value="Ask AI" forceMount onSelect={setRan}>
                        Ask AI
                    </Command.Item>
                </Command.List>
            </Command.Root>
            <Output values={{ ran }} />
        </>
    );
}
