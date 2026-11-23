import { progressValue } from "@fragiola/primitives/range";
import { computed, defineComponent, type PropType, provide, ref } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    type MeterComputed,
    MeterKey,
    type MeterState,
    meterState,
} from "./meter-context.ts";

export interface MeterRootProps {
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
export const MeterRoot: PartComponent<MeterRootProps, MeterState> =
    publicComponent(
        defineComponent({
            name: "MeterRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: { type: Number, required: true },
                min: { type: Number, default: 0 },
                max: { type: Number, default: 100 },
                format: {
                    type: Object as PropType<Intl.NumberFormatOptions>,
                    default: undefined,
                },
                locale: { type: String, default: undefined },
                getAriaValueText: {
                    type: Function as PropType<
                        (formattedValue: string, value: number) => string
                    >,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const labelId = ref<string>();
                const current = computed<MeterComputed>(() => {
                    const { min, max } = props;
                    // a meter's value is never indeterminate: the progress math with a number
                    const computedValue = progressValue(props.value, {
                        min,
                        max,
                        format: props.format,
                        locale: props.locale,
                    });
                    return {
                        min,
                        max,
                        value: computedValue.value ?? min,
                        percent: computedValue.percent ?? 0,
                        formattedValue: computedValue.formattedValue,
                    };
                });
                provide(MeterKey, { current, labelId });
                return () => {
                    const { value, formattedValue, min, max } = current.value;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        meterState(current.value),
                        {
                            role: "meter",
                            "aria-valuemin": min,
                            "aria-valuemax": max,
                            "aria-valuenow": value,
                            "aria-valuetext":
                                props.getAriaValueText !== undefined
                                    ? props.getAriaValueText(
                                          formattedValue,
                                          value,
                                      )
                                    : formattedValue,
                            "aria-labelledby": labelId.value,
                            "data-primitives-part": "meter-root",
                        },
                    );
                };
            },
        }),
    );
