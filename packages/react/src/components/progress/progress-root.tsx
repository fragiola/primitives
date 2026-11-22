import { progressValue } from "@fragiola/primitives/range";
import { useMemo, useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressContext,
    type ProgressState,
    statusAttributes,
} from "./progress-context.ts";

export interface ProgressRootProps extends PartProps<ProgressState> {
    /** A number, or `null` for an indeterminate progress; clamped to `[min, max]`. */
    value: number | null;
    min?: number;
    max?: number;
    /** How the value is written; default: a percentage of the range. */
    format?: Intl.NumberFormatOptions;
    /** The locale of `format` (BCP 47; default: the runtime's). */
    locale?: string;
    /** The Root's `aria-valuetext` instead of the formatted value. */
    getAriaValueText?: (formattedValue: string, value: number | null) => string;
}

/** The `progressbar`: holds the value, its status and its formatted text (spec/progress.md). */
export function ProgressRoot({
    value: valueProp,
    min = 0,
    max = 100,
    format,
    locale,
    getAriaValueText,
    ...props
}: ProgressRootProps) {
    const [labelId, setLabelId] = useState<string>();
    const { value, percent, status, formattedValue } = progressValue(
        valueProp,
        { min, max, format, locale },
    );
    const context = useMemo(
        () => ({
            value,
            min,
            max,
            status,
            percent,
            formattedValue,
            setLabelId,
        }),
        [value, min, max, status, percent, formattedValue],
    );
    const valueText =
        getAriaValueText !== undefined
            ? getAriaValueText(formattedValue, value)
            : status === "indeterminate"
              ? undefined
              : formattedValue;
    return (
        <ProgressContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                { value, min, max, status },
                {
                    role: "progressbar",
                    "aria-valuemin": min,
                    "aria-valuemax": max,
                    "aria-valuenow": value ?? undefined,
                    "aria-valuetext": valueText,
                    "aria-labelledby": labelId,
                    "data-primitives-part": "progress-root",
                    ...stateAttributes(statusAttributes(status)),
                },
            )}
        </ProgressContext.Provider>
    );
}
