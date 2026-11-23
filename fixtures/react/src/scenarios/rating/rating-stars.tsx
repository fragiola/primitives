import { Rating } from "../../kit/ui/rating.tsx";

/**
 * A star's name (spec/rating.md, "Scenarios"): "1 star", "2 stars", ...; the checked star of a
 * half value is named by the value ("2.5 stars").
 */
export function starName(index: number, value: number): string {
    if (value > 0 && Math.ceil(value) === index && value !== index) {
        return `${value} stars`;
    }
    return index === 1 ? "1 star" : `${index} stars`;
}

/** The stars of a Root, from its children function's items. */
export function RatingStars({
    items,
    value,
}: {
    items: number[];
    value: number;
}) {
    return items.map((index) => (
        <Rating.Item
            key={index}
            index={index}
            aria-label={starName(index, value)}
        />
    ));
}
