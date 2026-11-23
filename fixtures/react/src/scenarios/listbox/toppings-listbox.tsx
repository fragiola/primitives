import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxOptions } from "./listbox-options.tsx";
import { printValue, TOPPINGS } from "./options.ts";

/** The toppings of `/listbox/multiple` and `/listbox/replace` (spec/listbox.md). */
export function ToppingsListbox({
    selectionBehavior,
}: {
    selectionBehavior: "toggle" | "replace";
}) {
    const [value, setValue] = useState<readonly string[]>([]);
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <h2 id="toppings" className="text-sm font-semibold">
                    Toppings
                </h2>
                <Listbox.Root
                    aria-labelledby="toppings"
                    multiple
                    selectionBehavior={selectionBehavior}
                    value={value}
                    onValueChange={(next: string[]) => setValue(next)}
                >
                    <ListboxOptions options={TOPPINGS} />
                </Listbox.Root>
            </div>
            <Output values={{ value: printValue(value) }} />
        </>
    );
}
