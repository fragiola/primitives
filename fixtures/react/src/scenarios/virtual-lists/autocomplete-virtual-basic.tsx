import { useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { AutocompleteVirtual } from "../../kit/ui/virtual-lists.tsx";
import { LABELS } from "./items.ts";

/** An Autocomplete over the 10 000 labels, with an AutocompleteVirtual List (spec/virtual-lists.md). */
export function AutocompleteVirtualBasic() {
    const id = useId();
    const [value, setValue] = useState("");
    return (
        <>
            <Autocomplete.Root
                items={LABELS}
                value={value}
                onValueChange={(next: string) => setValue(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        Search
                    </label>
                    <Autocomplete.InputGroup>
                        <Autocomplete.Input id={id} />
                    </Autocomplete.InputGroup>
                </div>
                <Autocomplete.Portal>
                    <Autocomplete.Positioner sideOffset={4}>
                        <Autocomplete.Popup>
                            <AutocompleteVirtual.List>
                                {(label: string) => (
                                    <Autocomplete.Item value={label}>
                                        {label}
                                    </Autocomplete.Item>
                                )}
                            </AutocompleteVirtual.List>
                        </Autocomplete.Popup>
                    </Autocomplete.Positioner>
                </Autocomplete.Portal>
            </Autocomplete.Root>
            <Output values={{ value }} />
        </>
    );
}
