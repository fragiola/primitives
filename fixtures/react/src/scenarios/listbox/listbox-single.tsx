import type { ChangeDetails } from "@fragiola/primitives-react/listbox";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxOptions } from "./listbox-options.tsx";
import { FRUITS, printValue } from "./options.ts";

export function ListboxSingle() {
    const [value, setValue] = useState<string | null>(null);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <h2 id="fruit" className="text-sm font-semibold">
                    Fruit
                </h2>
                <Listbox.Root
                    aria-labelledby="fruit"
                    value={value}
                    onValueChange={(
                        next: string | null,
                        details: ChangeDetails,
                    ) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                >
                    <ListboxOptions options={FRUITS} />
                </Listbox.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ value: printValue(value), reason }} />
        </>
    );
}
