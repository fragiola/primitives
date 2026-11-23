import type { ChangeDetails } from "@fragiola/primitives-react/search-field";
import { useEffect, useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { SearchField } from "../../kit/ui/search-field.tsx";

/** A search form (spec/search-field.md, `/search-field/basic`). */
export function SearchFieldBasic() {
    const [value, setValue] = useState<string>();
    const [reason, setReason] = useState<string>();
    const [submitted, setSubmitted] = useState<string>();
    const [escapes, setEscapes] = useState(0);
    const [form, setForm] = useState<string>();
    // the Escape key downs that reach the page with their default not prevented
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                setEscapes((count) => count + 1);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);
    return (
        <>
            <search aria-label="Products">
                <form
                    className="flex flex-col items-start gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        setForm(formEntries(event.currentTarget));
                    }}
                >
                    <label htmlFor="search" className="text-sm font-medium">
                        Search
                    </label>
                    <SearchField.Root
                        id="search"
                        name="q"
                        onValueChange={(
                            next: string,
                            details: ChangeDetails,
                        ) => {
                            setValue(next);
                            setReason(details.reason);
                        }}
                        onSubmit={setSubmitted}
                    >
                        <SearchField.Input placeholder="Lamps, desks…" />
                        <SearchField.ClearButton aria-label="Clear search" />
                    </SearchField.Root>
                    <button type="submit">Go</button>
                </form>
            </search>
            <Output
                values={{
                    value,
                    reason,
                    submitted,
                    "page-escape": escapes,
                    form,
                }}
            />
        </>
    );
}
