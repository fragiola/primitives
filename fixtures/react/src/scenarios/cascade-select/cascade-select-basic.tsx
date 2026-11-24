import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { pathText } from "./location-items.ts";
import { LocationSelect } from "./location-select.tsx";

/** spec/cascade-select.md, `/cascade-select/basic` */
export function CascadeSelectBasic() {
    const [value, setValue] = useState<string>();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <label htmlFor="location" className="text-sm font-medium">
                    Location
                </label>
                <LocationSelect
                    id="location"
                    name="location"
                    required
                    separator=" / "
                    onValueChange={(next) => setValue(pathText(next))}
                    onOpenChange={(next, why) => {
                        setOpen(next);
                        setReason(why);
                    }}
                />
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, open, reason, form }} />
        </>
    );
}
