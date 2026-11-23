import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { type Ref, useEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RatingContext } from "./rating-context.ts";
import type { RatingRootState } from "./rating-root.tsx";

const NOOP = () => {};

/**
 * The Rating's form value (spec/rating.md, "Forms"): a visually hidden input with the score as
 * text, its `name` only while there is one, validated by the browser.
 */
export function RatingHiddenInput(props: PartProps<RatingRootState>) {
    const rating = useRequiredContext(RatingContext, "Rating.HiddenInput");
    const input = useRef<HTMLInputElement | null>(null);
    const latest = useRef(rating);
    latest.current = rating;
    const { setHiddenInput } = rating;
    useEffect(() => {
        const element = input.current;
        setHiddenInput(element);
        if (element === null) {
            return undefined;
        }
        const stop = bridgeForm(element, {
            reset: () => {
                latest.current.reset();
                // the browser reset the input to its mount-time default: write the rendered value
                // back (a render that changes it patches it again)
                const value = latest.current.value;
                element.value = value > 0 ? String(value) : "";
            },
            invalid: () => latest.current.tabStopElement(),
        });
        return () => {
            stop();
            setHiddenInput(null);
        };
    }, [setHiddenInput]);
    const { value } = rating;
    const state = {
        value,
        disabled: rating.disabled,
        readOnly: rating.readOnly,
        required: rating.required,
    };
    return renderElement(
        "input",
        props,
        state,
        {
            "aria-hidden": "true",
            tabIndex: -1,
            name: value > 0 ? rating.name : undefined,
            value: value > 0 ? String(value) : "",
            required: rating.required,
            disabled: rating.disabled,
            onChange: NOOP,
            style: VISUALLY_HIDDEN_INPUT_STYLE,
            "data-primitives-part": "rating-hidden-input",
        },
        input as Ref<HTMLElement>,
    );
}
