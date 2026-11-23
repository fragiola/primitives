import { type PlainDate, today } from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { defineComponent, type PropType } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { DateFieldState } from "./date-field-context.ts";
import {
    type DateFieldRootSharedProps,
    dateFieldSharedProps,
    useDateFieldRoot,
} from "./date-field-root-base.ts";

/** A DateField's value: a date, or a date and time with a time granularity. */
export type DateFieldValue = PlainDate | PlainDateTime;

export interface DateFieldRootProps extends DateFieldRootSharedProps {
    /** A `PlainDate` (`day`) or a `PlainDateTime`; `null` while a segment is a placeholder (`v-model:value`). */
    value?: DateFieldValue | null;
    defaultValue?: DateFieldValue | null;
    /** `day` (the default), or `hour`, `minute`, `second` for a date and time. */
    granularity?: SegmentGranularity;
    /** What a placeholder segment's first step gives; default: today at midnight. */
    placeholderValue?: DateFieldValue;
    /** Values before it are invalid (a `PlainDate` counts as its midnight). */
    min?: DateFieldValue;
    /** Values after it are invalid. */
    max?: DateFieldValue;
    /** An unavailable date is invalid. */
    isDateUnavailable?: (date: PlainDate) => boolean;
}

export type DateFieldRootEmits = {
    "update:value": (value: DateFieldValue | null) => true;
    valueChange: (value: DateFieldValue | null, details: ChangeDetails) => true;
};

const VALUE = Object as PropType<DateFieldValue | null>;
const BOUND = Object as PropType<DateFieldValue>;

/** A date (and, with a time granularity, a time) typed in segments (spec/date-field.md). */
export const DateFieldRoot: PartComponent<
    DateFieldRootProps,
    DateFieldState,
    DateFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "DateFieldRoot",
        inheritAttrs: false,
        props: {
            ...dateFieldSharedProps,
            value: { type: VALUE, default: undefined },
            defaultValue: { type: VALUE, default: null },
            granularity: {
                type: String as PropType<SegmentGranularity>,
                default: "day",
            },
            placeholderValue: { type: BOUND, default: undefined },
            min: { type: BOUND, default: undefined },
            max: { type: BOUND, default: undefined },
            isDateUnavailable: {
                type: Function as PropType<(date: PlainDate) => boolean>,
                default: undefined,
            },
        },
        emits: {
            "update:value": (_value: DateFieldValue | null) => true,
            valueChange: (
                _value: DateFieldValue | null,
                _details: ChangeDetails,
            ) => true,
        },
        setup(props, { attrs, slots, emit }) {
            // today, read once when the field renders (as the calendars' today)
            const todayDate = today();
            return useDateFieldRoot<DateFieldValue>({
                component: "date-field",
                kind: "date",
                props,
                granularity: () => props.granularity,
                value: () => props.value,
                defaultValue: () => props.defaultValue,
                placeholderValue: () => props.placeholderValue ?? todayDate,
                min: () => props.min,
                max: () => props.max,
                isDateUnavailable: () => props.isDateUnavailable,
                onChange: (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
                attrs,
                slots,
            });
        },
    }),
);
