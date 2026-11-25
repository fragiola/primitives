import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Combobox } from "../../kit/ui/combobox.tsx";
import { FruitPopup } from "./fruit-combobox.tsx";
import { FRUITS, type Fruit, printValues } from "./fruits.ts";

/** spec/combobox.md, `/combobox/auto-highlight` */
export function ComboboxAutoHighlight() {
    const id = useId();
    const [value, setValue] = useState<Fruit | null>(null);
    return (
        <>
            <Combobox.Root
                items={FRUITS}
                autoHighlight
                onValueChange={(next: Fruit | null) => setValue(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Fruit
                    </label>
                    <Combobox.InputGroup>
                        <Combobox.Input id={id} />
                    </Combobox.InputGroup>
                </div>
                <FruitPopup />
            </Combobox.Root>
            <Output values={{ value: printValues(value) }} />
        </>
    );
}
