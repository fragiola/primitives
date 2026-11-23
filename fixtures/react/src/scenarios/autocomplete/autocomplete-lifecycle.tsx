import { useId } from "react";
import { useLifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { FruitPopup } from "./fruit-popup.tsx";
import { FRUITS } from "./suggestions.ts";

/** spec/README.md, "The lifecycle scenarios". */
export function AutocompleteLifecycle({ cancel }: { cancel?: boolean }) {
    const lifecycle = useLifecycle(cancel);
    const id = useId();
    return (
        <>
            <Autocomplete.Root
                items={FRUITS}
                onOpenChange={lifecycle.onOpenChange}
                onOpenChangeComplete={lifecycle.onOpenChangeComplete}
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
                <FruitPopup keepMounted />
            </Autocomplete.Root>
            <Output values={lifecycle.values} />
        </>
    );
}
