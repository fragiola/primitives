import { defineComponent, h, type PropType, provide, useId } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { type AsProp, asProp } from "../../utils/render-part.ts";
import {
    type DateFieldContext,
    DateFieldKey,
} from "../date-field/date-field-context.ts";
import {
    DateFieldInput,
    type DateFieldInputSlots,
} from "../date-field/date-field-input.ts";
import {
    DateRangeFieldKey,
    type RangeEnd,
} from "./date-range-field-context.ts";

export interface DateRangeFieldInputProps {
    /** The end whose segments it holds. */
    range: RangeEnd;
}

/**
 * The `group` of one end's segments (spec/date-range-field.md, "Anatomy"): named by the
 * consumer (`aria-label`) and, inside a Field, by its label too; its segments by both and their
 * own name ("Stay Start date month").
 */
export const DateRangeFieldInput: PublicComponent<
    DateRangeFieldInputProps & { as?: AsProp },
    DateFieldInputSlots
> = publicComponent(
    defineComponent({
        name: "DateRangeFieldInput",
        inheritAttrs: false,
        props: {
            ...asProp,
            range: {
                type: String as PropType<RangeEnd>,
                required: true,
            },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                DateRangeFieldKey,
                "DateRangeField.Input",
            );
            const generated = useId();
            const id = () =>
                typeof attrs.id === "string" ? attrs.id : generated;
            const group = () => context.groups[props.range];
            const labelledBy = () => {
                const named = attrs["aria-label"] !== undefined;
                return (
                    [group().labelId(), named ? id() : undefined]
                        .filter((part) => part !== undefined)
                        .join(" ") || undefined
                );
            };
            // the end's group, its segments named by the Input too
            const own: DateFieldContext = {
                get component() {
                    return group().component;
                },
                get inputPart() {
                    return group().inputPart;
                },
                get state() {
                    return group().state;
                },
                get format() {
                    return group().format;
                },
                get segments() {
                    return group().segments;
                },
                labelId: labelledBy,
                get field() {
                    return group().field;
                },
                attributes: () => group().attributes(),
                setInputElement: (value) => group().setInputElement(value),
                onSegmentKey: (segment, event, element) =>
                    group().onSegmentKey(segment, event, element),
                onSegmentText: (segment, text, event, element) =>
                    group().onSegmentText(segment, text, event, element),
                onSegmentBlur: (segment, event) =>
                    group().onSegmentBlur(segment, event),
            };
            provide(DateFieldKey, own);
            return () =>
                h(
                    DateFieldInput,
                    {
                        as: props.as,
                        id: id(),
                        "aria-labelledby":
                            group().labelId() === undefined
                                ? undefined
                                : labelledBy(),
                        "data-range": props.range,
                        ...attrs,
                    },
                    slots,
                );
        },
    }),
);
