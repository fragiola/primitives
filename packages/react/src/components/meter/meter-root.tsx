import { progressValue } from "@fragiola/primitives/range";
import { useMemo, useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MeterContext, type MeterState } from "./meter-context.ts";

export interface MeterRootProps extends PartProps<MeterState> {
    /** The measurement; clamped to `[min, max]`. */
    value: number;
    min?: number;
    max?: number;
    /** How the value is written; default: a percentage of the range. */
    format?: Intl.NumberFormatOptions;
    /** The locale of `format` (BCP 47; default: the runtime's). */
    locale?: string;
    /** The Root's `aria-valuetext` instead of the formatted value. */
    getAriaValueText?: (formattedValue: string, value: number) => string;
}

/** The `meter`: holds the value and its formatted text (spec/meter.md). */
export function MeterRoot({
    value: valueProp,
    min = 0,
    max = 100,
    format,
    locale,
    getAriaValueText,
    ...props
}: MeterRootProps) {
    const [labelId, setLabelId] = useState<string>();
    // a meter's value is never indeterminate: the progress math with a number always
    const computed = progressValue(valueProp, { min, max, format, locale });
    const value = computed.value ?? min;
    const percent = computed.percent ?? 0;
    const { formattedValue } = computed;
    const context = useMemo(
        () => ({ value, min, max, percent, formattedValue, setLabelId }),
        [value, min, max, percent, formattedValue],
    );
    return (
        <MeterContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                { value, min, max },
                {
                    role: "meter",
                    "aria-valuemin": min,
                    "aria-valuemax": max,
                    "aria-valuenow": value,
                    "aria-valuetext":
                        getAriaValueText !== undefined
                            ? getAriaValueText(formattedValue, value)
                            : formattedValue,
                    "aria-labelledby": labelId,
                    "data-primitives-part": "meter-root",
                },
            )}
        </MeterContext.Provider>
    );
}
