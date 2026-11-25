import { watchScrub } from "@fragiola/primitives/number";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NumberFieldContext,
    type NumberFieldState,
    numberFieldState,
} from "./number-field-context.ts";

export interface NumberFieldScrubAreaProps extends PartProps<NumberFieldState> {
    /** The axis the pointer scrubs along (default `"horizontal"`). */
    direction?: "horizontal" | "vertical";
    /** The pixels one step takes (default `2`). */
    pixelSensitivity?: number;
}

const STYLE = { touchAction: "none", userSelect: "none" } as const;

/** A press dragged along it steps the value (spec/number-field.md, "Pointer": scrub). */
export function NumberFieldScrubArea({
    direction = "horizontal",
    pixelSensitivity = 2,
    ...props
}: NumberFieldScrubAreaProps) {
    const context = useRequiredContext(
        NumberFieldContext,
        "NumberField.ScrubArea",
    );
    const [element, setElement] = useState<HTMLElement | null>(null);
    const latest = useRef(context);
    latest.current = context;
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return watchScrub(element, {
            direction,
            pixelSensitivity,
            onStart: () => {
                const current = latest.current;
                if (current.disabled || current.readOnly) {
                    return false;
                }
                current.setScrubbing(true);
                return true;
            },
            onScrub: (steps, event) => {
                const current = latest.current;
                const amount = current.amount(event);
                current.stepBy(
                    steps > 0 ? amount : -amount,
                    "scrub",
                    event,
                    Math.abs(steps),
                );
            },
            onEnd: (event) => {
                latest.current.setScrubbing(false);
                latest.current.commit(event);
            },
            onCursor: (point) => latest.current.setCursor(point),
        });
    }, [element, direction, pixelSensitivity]);
    return renderElement(
        "span",
        props,
        numberFieldState(context),
        {
            style: STYLE,
            // a press keeps the focus where it is
            onMouseDown: (event: MouseEvent<HTMLElement>) => {
                if (event.button === 0) {
                    event.preventDefault();
                }
            },
            "data-primitives-part": "number-field-scrub-area",
            ...context.attributes,
        },
        setElement,
    );
}
