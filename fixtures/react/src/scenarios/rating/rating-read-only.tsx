import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Rating } from "../../kit/ui/rating.tsx";
import { RatingStars } from "./rating-stars.tsx";

/** A read-only and a disabled rating (spec/rating.md, `/rating/read-only`). */
export function RatingReadOnly() {
    const [value, setValue] = useState<number>();
    return (
        <>
            <div className="flex flex-col items-start gap-2">
                <h2 id="quality" className="text-sm font-semibold">
                    Quality
                </h2>
                <Rating.Root
                    aria-labelledby="quality"
                    readOnly
                    defaultValue={3}
                    onValueChange={(next) => setValue(next)}
                >
                    {({ items, value: current }) => (
                        <RatingStars items={items} value={current} />
                    )}
                </Rating.Root>
                <h2 id="service" className="text-sm font-semibold">
                    Service
                </h2>
                <Rating.Root
                    aria-labelledby="service"
                    disabled
                    defaultValue={2}
                    onValueChange={(next) => setValue(next)}
                >
                    {({ items, value: current }) => (
                        <RatingStars items={items} value={current} />
                    )}
                </Rating.Root>
            </div>
            <button type="button" className="mt-2">
                After
            </button>
            <Output values={{ value }} />
        </>
    );
}
