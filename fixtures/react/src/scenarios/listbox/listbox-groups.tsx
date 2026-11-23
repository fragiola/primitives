import { Fragment, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxOptions } from "./listbox-options.tsx";
import { PRODUCE, printValue } from "./options.ts";

export function ListboxGroups() {
    const [value, setValue] = useState<string | null>(null);
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <h2 id="produce" className="text-sm font-semibold">
                    Produce
                </h2>
                <Listbox.Root
                    aria-labelledby="produce"
                    onValueChange={(next: string | null) => setValue(next)}
                >
                    {PRODUCE.map((group, index) => (
                        <Fragment key={group.label}>
                            {index > 0 ? <Listbox.Separator /> : null}
                            <Listbox.Group>
                                <Listbox.GroupLabel>
                                    {group.label}
                                </Listbox.GroupLabel>
                                <ListboxOptions options={group.items} />
                            </Listbox.Group>
                        </Fragment>
                    ))}
                </Listbox.Root>
            </div>
            <Output values={{ value: printValue(value) }} />
        </>
    );
}
