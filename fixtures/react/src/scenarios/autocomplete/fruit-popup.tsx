import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import type { Fruit } from "./suggestions.ts";

/** The fruits' popup: an Empty (when given) and the List, each Item its label. */
export function FruitPopup({
    empty = "No suggestion.",
    keepMounted = false,
}: {
    empty?: string | null;
    keepMounted?: boolean;
}) {
    return (
        <Autocomplete.Portal keepMounted={keepMounted}>
            <Autocomplete.Positioner sideOffset={4}>
                <Autocomplete.Popup>
                    {empty === null ? null : (
                        <Autocomplete.Empty>{empty}</Autocomplete.Empty>
                    )}
                    <Autocomplete.List>
                        {(fruit: Fruit) => (
                            <Autocomplete.Item
                                key={fruit.value}
                                value={fruit}
                                disabled={fruit.disabled}
                            >
                                {fruit.label}
                            </Autocomplete.Item>
                        )}
                    </Autocomplete.List>
                </Autocomplete.Popup>
            </Autocomplete.Positioner>
        </Autocomplete.Portal>
    );
}
