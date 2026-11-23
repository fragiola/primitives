import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { SearchField } from "../../kit/ui/search-field.tsx";

/** A disabled and a read-only SearchField (spec/search-field.md, `/search-field/states`). */
export function SearchFieldStates() {
    const [value, setValue] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label
                    htmlFor="disabled-search"
                    className="text-sm font-medium"
                >
                    Disabled search
                </label>
                <SearchField.Root
                    id="disabled-search"
                    disabled
                    defaultValue="chairs"
                    onValueChange={setValue}
                >
                    <SearchField.Input />
                    <SearchField.ClearButton aria-label="Clear disabled search" />
                </SearchField.Root>
                <label htmlFor="saved-search" className="text-sm font-medium">
                    Saved search
                </label>
                <SearchField.Root
                    id="saved-search"
                    readOnly
                    defaultValue="tables"
                    onValueChange={setValue}
                >
                    <SearchField.Input />
                    <SearchField.ClearButton aria-label="Clear saved search" />
                </SearchField.Root>
            </div>
            <Output values={{ value }} />
        </>
    );
}
