import type { SegmentGranularity } from "@fragiola/primitives/segments";
import type { PlainTime } from "@fragiola/primitives/time";
import { defineComponent, type PropType } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { DateFieldState } from "../date-field/date-field-context.ts";
import {
    type DateFieldRootSharedProps,
    dateFieldSharedProps,
    useDateFieldRoot,
} from "../date-field/date-field-root-base.ts";

export interface TimeFieldRootProps extends DateFieldRootSharedProps {
    /** A `PlainTime`; `null` while a segment is a placeholder (`v-model:value`). */
    value?: PlainTime | null;
    defaultValue?: PlainTime | null;
    /** `hour`, `minute` (the default) or `second`. */
    granularity?: Exclude<SegmentGranularity, "day">;
    /** What a placeholder segment's first step gives; default: midnight. */
    placeholderValue?: PlainTime;
    /** Times before it are invalid. */
    min?: PlainTime;
    /** Times after it are invalid. */
    max?: PlainTime;
}

export type TimeFieldRootEmits = {
    "update:value": (value: PlainTime | null) => true;
    valueChange: (value: PlainTime | null, details: ChangeDetails) => true;
};

const MIDNIGHT: PlainTime = { hour: 0, minute: 0, second: 0, millisecond: 0 };
const VALUE = Object as PropType<PlainTime | null>;
const BOUND = Object as PropType<PlainTime>;

/** A time of day typed in segments (spec/date-field.md, TimeField). */
export const TimeFieldRoot: PartComponent<
    TimeFieldRootProps,
    DateFieldState,
    TimeFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "TimeFieldRoot",
        inheritAttrs: false,
        props: {
            ...dateFieldSharedProps,
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
            "update:value": (_value: PlainTime | null) => true,
            valueChange: (_value: PlainTime | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            return useDateFieldRoot<PlainTime>({
                component: "time-field",
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
