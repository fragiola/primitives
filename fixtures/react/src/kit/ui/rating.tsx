import { Rating as Primitive } from "@fragiola/primitives-react/rating";
import { rating } from "examples-shared/recipes/rating";
import type { ComponentProps } from "react";

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** The star mark: an outline, and its fill over it (the recipe shows it by the Item's state). */
function Star() {
    return (
        <>
            <svg className={rating.star} viewBox="0 0 24 24" aria-hidden="true">
                <path d={STAR} />
            </svg>
            <span className={rating.fill} aria-hidden="true">
                <svg
                    className={rating.star}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d={STAR} />
                </svg>
            </span>
        </>
    );
}

export const Rating = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={rating.root} {...props} />
    ),
    /** The styled star. */
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={rating.item} {...props}>
            <Star />
        </Primitive.Item>
    ),
    HiddenInput: Primitive.HiddenInput,
};
