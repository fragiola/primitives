import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime, TimeRange } from "@fragiola/primitives/time";
import { defineComponent, type PropType } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { DateFieldState } from "../date-field/date-field-context.ts";
import {
    type DateRangeFieldRootSharedProps,
    dateRangeFieldSharedProps,
    useDateRangeFieldRoot,
} from "../date-range-field/date-range-field-root-base.ts";

export interface TimeRangeFieldRootProps extends DateRangeFieldRootSharedProps {
    /** `{ start, end }` of `PlainTime`s; `null` while a segment of either end is a placeholder (`v-model:value`). */
    value?: TimeRange | null;
    defaultValue?: TimeRange | null;
    /** `hour`, `minute` (the default) or `second`. */
    granularity?: Exclude<SegmentGranularity, "day">;
    /** What a placeholder segment's first step gives; default: midnight. */
    placeholderValue?: PlainTime;
    /** Times before it are invalid. */
    min?: PlainTime;
    /** Times after it are invalid. */
    max?: PlainTime;
}

export type TimeRangeFieldRootEmits = {
    "update:value": (value: TimeRange | null) => true;
    valueChange: (value: TimeRange | null, details: ChangeDetails) => true;
};

const MIDNIGHT: PlainTime = { hour: 0, minute: 0, second: 0, millisecond: 0 };
const VALUE = Object as PropType<TimeRange | null>;
const BOUND = Object as PropType<PlainTime>;

/** A start and an end time of day typed in segments (spec/date-range-field.md, TimeRangeField). */
export const TimeRangeFieldRoot: PartComponent<
    TimeRangeFieldRootProps,
    DateFieldState,
    TimeRangeFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "TimeRangeFieldRoot",
        inheritAttrs: false,
        props: {
            ...dateRangeFieldSharedProps,
            value: { type: VALUE, default: undefined },
            defaultValue: { type: VALUE, default: null },
            granularity: {
                type: String as PropType<Exclude<SegmentGranularity, "day">>,
                default: "minute",
            },
            placeholderValue: { type: BOUND, default: undefined },
            min: { type: BOUND, default: undefined },
            max: { type: BOUND, default: undefined },
        },
        emits: {
            "update:value": (_value: TimeRange | null) => true,
            valueChange: (_value: TimeRange | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            return useDateRangeFieldRoot<PlainTime>({
                component: "time-range-field",
                kind: "time",
                props,
                granularity: () => props.granularity,
                value: () => props.value,
                defaultValue: () => props.defaultValue,
                placeholderValue: () => props.placeholderValue ?? MIDNIGHT,
                min: () => props.min,
                max: () => props.max,
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
