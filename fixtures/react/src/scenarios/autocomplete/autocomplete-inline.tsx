import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { FruitPopup } from "./fruit-popup.tsx";
import { FRUITS } from "./suggestions.ts";

export function AutocompleteInline() {
    const id = useId();
    const [value, setValue] = useState("");
    return (
        <>
            <Autocomplete.Root
                mode="inline"
                items={FRUITS}
                value={value}
                onValueChange={(next: string) => setValue(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Fruit
                    </label>
                    <Autocomplete.InputGroup>
                        <Autocomplete.Input id={id} />
                        <Autocomplete.Trigger aria-label="Show suggestions">
                            ▾
                        </Autocomplete.Trigger>
                    </Autocomplete.InputGroup>
                </div>
                <FruitPopup empty={null} />
            </Autocomplete.Root>
            <Output values={{ value }} />
        </>
    );
}
