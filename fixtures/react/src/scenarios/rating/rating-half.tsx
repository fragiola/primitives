import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Rating } from "../../kit/ui/rating.tsx";
import { RatingStars } from "./rating-stars.tsx";

/** A controlled rating in half steps that clears (spec/rating.md, `/rating/half`). */
export function RatingHalf() {
    const [value, setValue] = useState(2.5);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <h2 id="half-rating" className="text-sm font-semibold">
                Half rating
            </h2>
            <Rating.Root
                aria-labelledby="half-rating"
                allowHalf
                allowClear
                value={value}
                onValueChange={(next, details) => {
                    setValue(next);
                    setReason(details.reason);
                }}
            >
                {({ items }) => <RatingStars items={items} value={value} />}
            </Rating.Root>
            <Output values={{ value, reason }} />
        </>
    );
}
