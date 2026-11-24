import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Command } from "../../kit/ui/command.tsx";
import { CommandItems } from "./command-items.tsx";

/** spec/command.md, `/command/basic` */
export function CommandBasic() {
    const [ran, setRan] = useState<string>();
    const [search, setSearch] = useState("");
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <Command.Root
                    inputValue={search}
                    onInputValueChange={(value: string) => setSearch(value)}
                >
                    <Command.Input aria-label="Command" />
                    <Command.Empty>No results.</Command.Empty>
                    <Command.List>
                        <CommandItems onRun={setRan} />
                    </Command.List>
                </Command.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ ran, search }} />
        </>
    );
}
