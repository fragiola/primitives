import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Rating } from "../../kit/ui/rating.tsx";
import { RatingStars } from "./rating-stars.tsx";

/** A rating in a form (spec/rating.md, `/rating/basic`). */
export function RatingBasic() {
    const [value, setValue] = useState<number>();
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
                <h2 id="rating" className="text-sm font-semibold">
                    Rating
                </h2>
                <Rating.Root
                    aria-labelledby="rating"
                    name="rating"
                    onValueChange={(next, details) => {
                        setValue(next);
                        setReason(details.reason);
                    }}
                >
                    {({ items, value: current }) => (
                        <>
                            <RatingStars items={items} value={current} />
                            <Rating.HiddenInput />
                        </>
                    )}
                </Rating.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, reason, form }} />
        </>
    );
}
