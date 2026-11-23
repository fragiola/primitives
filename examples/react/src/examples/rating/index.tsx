import { Rating } from "@fragiola/primitives-react/rating";
import { useState } from "react";
import { styles } from "./styles.ts";

const AVERAGE = 4.5;

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** A star's name: "1 star", "2 stars", ...; the star that holds a half value is named by it. */
function starName(index: number, value: number) {
    if (Math.ceil(value) === index && value !== index) return `${value} stars`;
    return index === 1 ? "1 star" : `${index} stars`;
}

/** The mark: an outlined star, and a filled one over it that the recipe shows by the state. */
function Star() {
    return (
        <>
            <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
                <path d={STAR} />
            </svg>
            <span className={styles.fill} aria-hidden="true">
                <svg
                    className={styles.star}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d={STAR} />
                </svg>
            </span>
        </>
    );
}

// A product rating (spec/rating.md): the reviews' average, read-only and in half steps (focusable,
// nothing changes it), and the reader's own score. The pointer previews a score, a press or an
// arrow chooses it, Home and End reach the ends, and pressing the chosen star again clears it.
export default function ProductRating() {
    const [score, setScore] = useState(0);
    return (
        <div className={styles.stack}>
            <div className={styles.row}>
                <span id="average-label" className={styles.label}>
                    Average rating
                </span>
                <Rating.Root
                    aria-labelledby="average-label"
                    readOnly
                    allowHalf
                    defaultValue={AVERAGE}
                    className={styles.root}
                >
                    {({ items }) =>
                        items.map((index) => (
                            <Rating.Item
                                key={index}
                                index={index}
                                aria-label={starName(index, AVERAGE)}
                                className={styles.item}
                            >
                                <Star />
                            </Rating.Item>
                        ))
                    }
                </Rating.Root>
                <span className={styles.note}>From 128 reviews.</span>
            </div>
            <div className={styles.row}>
                <span id="score-label" className={styles.label}>
                    Your rating
                </span>
                <Rating.Root
                    aria-labelledby="score-label"
                    allowClear
                    value={score}
                    onValueChange={setScore}
                    className={styles.root}
                >
                    {({ items }) =>
                        items.map((index) => (
                            <Rating.Item
                                key={index}
                                index={index}
                                aria-label={starName(index, score)}
                                className={styles.item}
                            >
                                <Star />
                            </Rating.Item>
                        ))
                    }
                </Rating.Root>
                <p role="status" className={styles.note}>
                    {score === 0
                        ? "Not rated yet."
                        : `You rated it ${starName(score, score)}.`}
                </p>
            </div>
        </div>
    );
}
