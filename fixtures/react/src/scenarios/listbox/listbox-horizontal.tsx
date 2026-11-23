import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxOptions } from "./listbox-options.tsx";
import { printValue, SIZES } from "./options.ts";

export function ListboxHorizontal() {
    const [value, setValue] = useState<string | null>("m");
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <h2 id="size" className="text-sm font-semibold">
                    Size
                </h2>
                <Listbox.Root
                    aria-labelledby="size"
                    orientation="horizontal"
                    loopFocus={false}
                    defaultValue="m"
                    onValueChange={(next: string | null) => setValue(next)}
                >
                    <ListboxOptions options={SIZES} />
                </Listbox.Root>
            </div>
            <Output values={{ value: printValue(value) }} />
        </>
    );
}
