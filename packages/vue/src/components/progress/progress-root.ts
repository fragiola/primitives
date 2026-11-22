import { progressValue } from "@fragiola/primitives/range";
import { computed, defineComponent, type PropType, provide, ref } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressKey,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

export interface ProgressRootProps {
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
export const ProgressRoot: PartComponent<ProgressRootProps, ProgressState> =
    publicComponent(
        defineComponent({
            name: "ProgressRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                value: {
                    type: [Number, null] as PropType<number | null>,
                    required: true,
                },
                min: { type: Number, default: 0 },
                max: { type: Number, default: 100 },
                format: {
                    type: Object as PropType<Intl.NumberFormatOptions>,
                    default: undefined,
                },
                locale: { type: String, default: undefined },
                getAriaValueText: {
                    type: Function as PropType<
                        (formattedValue: string, value: number | null) => string
                    >,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const labelId = ref<string>();
                const current = computed(() => {
                    const { min, max } = props;
                    return {
                        min,
                        max,
                        ...progressValue(props.value, {
                            min,
                            max,
                            format: props.format,
                            locale: props.locale,
                        }),
                    };
                });
                provide(ProgressKey, { current, labelId });
                return () => {
                    const { value, status, formattedValue, min, max } =
                        current.value;
                    const valueText =
                        props.getAriaValueText !== undefined
                            ? props.getAriaValueText(formattedValue, value)
                            : status === "indeterminate"
                              ? undefined
                              : formattedValue;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        progressState(current.value),
                        {
                            role: "progressbar",
                            "aria-valuemin": min,
                            "aria-valuemax": max,
                            "aria-valuenow": value ?? undefined,
                            "aria-valuetext": valueText,
                            "aria-labelledby": labelId.value,
                            "data-primitives-part": "progress-root",
                            ...stateAttributes(statusAttributes(status)),
                        },
                    );
                };
            },
        }),
    );
