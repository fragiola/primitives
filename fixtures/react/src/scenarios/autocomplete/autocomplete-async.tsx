import { useEffect, useId, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { CityPopup } from "./city-popup.tsx";
import { CITIES } from "./suggestions.ts";

/** Suggestions loaded 300 ms after each change of the text (spec/autocomplete.md). */
export function AutocompleteAsync() {
    const id = useId();
    const [value, setValue] = useState("");
    const [items, setItems] = useState<readonly string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState<string>();
    useEffect(() => {
        if (value === "") {
            setItems([]);
            setLoading(false);
            return undefined;
        }
        setLoading(true);
        const query = value.trim().toLowerCase();
        const timer = setTimeout(() => {
            setItems(
                CITIES.filter((city) => city.toLowerCase().includes(query)),
            );
            setLoading(false);
            setLoaded(value);
        }, 300);
        return () => clearTimeout(timer);
    }, [value]);
    return (
        <>
            <Autocomplete.Root
                items={items}
                filter={null}
                value={value}
                onValueChange={(next: string) => setValue(next)}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-sm font-medium">
                        City
                    </label>
                    <Autocomplete.InputGroup>
                        <Autocomplete.Input id={id} />
                    </Autocomplete.InputGroup>
                    <Autocomplete.Status>
                        {loading ? "Loading…" : ""}
                    </Autocomplete.Status>
                </div>
                <CityPopup />
            </Autocomplete.Root>
            <Output values={{ value, loaded }} />
        </>
    );
}
