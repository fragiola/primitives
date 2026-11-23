import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Rating } from "../../kit/ui/rating.tsx";
import { RatingStars } from "./rating-stars.tsx";

/** A required rating in a Field (spec/rating.md, `/rating/field`). */
export function RatingField() {
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root>
                    <Field.Label>Satisfaction</Field.Label>
                    <Rating.Root required name="satisfaction">
                        {({ items, value }) => (
                            <>
                                <RatingStars items={items} value={value} />
                                <Rating.HiddenInput />
                            </>
                        )}
                    </Rating.Root>
                    <Field.Description>How was your stay?</Field.Description>
                    <Field.Error>Choose a rating.</Field.Error>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
