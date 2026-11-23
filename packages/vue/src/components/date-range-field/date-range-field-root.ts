import {
    type DateRange,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { defineComponent, type PropType } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { DateFieldState } from "../date-field/date-field-context.ts";
import type { DateFieldValue } from "../date-field/date-field-root.ts";
import {
    type DateRangeFieldRootSharedProps,
    dateRangeFieldSharedProps,
    type FieldRange,
    useDateRangeFieldRoot,
} from "./date-range-field-root-base.ts";

/** A DateRangeField's value: two dates, or two dates and times with a time granularity. */
export type DateRangeFieldValue =
    | DateRange
    | { readonly start: PlainDateTime; readonly end: PlainDateTime };

export interface DateRangeFieldRootProps extends DateRangeFieldRootSharedProps {
    /** `{ start, end }`; `null` while a segment of either end is a placeholder (`v-model:value`). */
    value?: DateRangeFieldValue | null;
    defaultValue?: DateRangeFieldValue | null;
    /** `day` (the default), or `hour`, `minute`, `second` for dates and times. */
    granularity?: SegmentGranularity;
    /** What a placeholder segment's first step gives; default: today at midnight. */
    placeholderValue?: DateFieldValue;
    /** Ends before it are invalid (a `PlainDate` counts as its midnight). */
    min?: DateFieldValue;
    /** Ends after it are invalid. */
    max?: DateFieldValue;
    /** A range whose start or end is unavailable is invalid. */
    isDateUnavailable?: (date: PlainDate) => boolean;
}

export type DateRangeFieldRootEmits = {
    "update:value": (value: DateRangeFieldValue | null) => true;
    valueChange: (
        value: DateRangeFieldValue | null,
        details: ChangeDetails,
    ) => true;
};

const VALUE = Object as PropType<DateRangeFieldValue | null>;
const BOUND = Object as PropType<DateFieldValue>;

/** A start and an end date typed in segments (spec/date-range-field.md). */
export const DateRangeFieldRoot: PartComponent<
    DateRangeFieldRootProps,
    DateFieldState,
    DateRangeFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "DateRangeFieldRoot",
        inheritAttrs: false,
        props: {
            ...dateRangeFieldSharedProps,
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
            "update:value": (_value: DateRangeFieldValue | null) => true,
            valueChange: (
                _value: DateRangeFieldValue | null,
                _details: ChangeDetails,
            ) => true,
        },
        setup(props, { attrs, slots, emit }) {
            // today, read once when the field renders (as the calendars' today)
            const todayDate = today();
            return useDateRangeFieldRoot<DateFieldValue>({
                component: "date-range-field",
                kind: "date",
                props,
                granularity: () => props.granularity,
                value: () =>
                    props.value as
                        | FieldRange<DateFieldValue>
                        | null
                        | undefined,
                defaultValue: () =>
                    props.defaultValue as FieldRange<DateFieldValue> | null,
                placeholderValue: () => props.placeholderValue ?? todayDate,
                min: () => props.min,
                max: () => props.max,
                isDateUnavailable: () => props.isDateUnavailable,
                onChange: (next, details) => {
                    emit("update:value", next as DateRangeFieldValue | null);
                    emit(
                        "valueChange",
                        next as DateRangeFieldValue | null,
                        details,
                    );
                },
                attrs,
                slots,
            });
        },
    }),
);
