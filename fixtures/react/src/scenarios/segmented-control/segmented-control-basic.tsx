import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { SegmentedControl } from "../../kit/ui/segmented-control.tsx";
import { Segments } from "./segments.tsx";
import { VIEWS } from "./views.ts";

/** A view switcher in a form (spec/segmented-control.md, `/segmented-control/basic`). */
export function SegmentedControlBasic() {
    const [value, setValue] = useState<string | null>();
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
                <h2 id="view" className="text-sm font-semibold">
                    View
                </h2>
                <SegmentedControl.Root
                    aria-labelledby="view"
                    name="view"
                    defaultValue="list"
                    onValueChange={(next, details) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                >
                    <Segments segments={VIEWS} />
                    <SegmentedControl.Indicator renderBeforeHydration />
                </SegmentedControl.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, reason, form }} />
        </>
    );
}
