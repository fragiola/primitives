import type { ChangeDetails } from "@fragiola/primitives-react/autocomplete";
import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { FruitPopup } from "./fruit-popup.tsx";
import { FRUITS } from "./suggestions.ts";

export function AutocompleteBasic() {
    const id = useId();
    const [value, setValue] = useState("");
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <Autocomplete.Root
                    items={FRUITS}
                    value={value}
                    onValueChange={(next: string, details: ChangeDetails) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                    open={open}
                    onOpenChange={(next: boolean, details: ChangeDetails) => {
                        setOpen(next);
                        setReason(details.reason);
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor={id} className="text-sm font-medium">
                            Search
                        </label>
                        <Autocomplete.InputGroup>
                            <Autocomplete.Input id={id} />
                            <Autocomplete.Clear aria-label="Clear search">
                                ×
                            </Autocomplete.Clear>
                            <Autocomplete.Trigger aria-label="Show suggestions">
                                ▾
                            </Autocomplete.Trigger>
                        </Autocomplete.InputGroup>
                    </div>
                    <FruitPopup />
                </Autocomplete.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ value, open, reason }} />
        </>
    );
}
