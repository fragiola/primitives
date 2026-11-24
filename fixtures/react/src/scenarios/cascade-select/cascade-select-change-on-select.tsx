import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { pathText } from "./location-items.ts";
import { LocationSelect } from "./location-select.tsx";

const AMERICAS = ["americas"];

/** spec/cascade-select.md, `/cascade-select/change-on-select` */
export function CascadeSelectChangeOnSelect() {
    const [value, setValue] = useState<string>();
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <label htmlFor="location" className="text-sm font-medium">
                    Location
                </label>
                <LocationSelect
                    id="location"
                    changeOnSelect
                    defaultValue={AMERICAS}
                    onValueChange={(next) => setValue(pathText(next))}
                    onOpenChange={(next) => setOpen(next)}
                />
            </div>
            <Output values={{ value, open }} />
        </>
    );
}
