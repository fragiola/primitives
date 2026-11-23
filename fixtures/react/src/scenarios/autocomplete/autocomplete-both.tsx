import type { ChangeDetails } from "@fragiola/primitives-react/autocomplete";
import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { FruitPopup } from "./fruit-popup.tsx";
import { FRUITS } from "./suggestions.ts";

export function AutocompleteBoth() {
    const id = useId();
    const [value, setValue] = useState("");
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <Autocomplete.Root
                    mode="both"
                    items={FRUITS}
                    value={value}
                    onValueChange={(next: string, details: ChangeDetails) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor={id} className="text-sm font-medium">
                            Fruit
                        </label>
                        <Autocomplete.InputGroup>
                            <Autocomplete.Input id={id} />
                        </Autocomplete.InputGroup>
                    </div>
                    <FruitPopup />
                </Autocomplete.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ value, reason }} />
        </>
    );
}
