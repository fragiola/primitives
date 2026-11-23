import type { DateSegment } from "@fragiola/primitives/segments";
import { defineComponent, h, type VNode, type VNodeChild } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import type { PublicComponent } from "../../utils/public-component.ts";
import { publicComponent } from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { DateFieldKey, type DateFieldState } from "./date-field-context.ts";
import { DateFieldSegment } from "./date-field-segment.ts";

/** The Input's slots: each segment (default: every segment with its own text), or `render`. */
export interface DateFieldInputSlots {
    default?: (scope: { segment: DateSegment }) => VNode[];
    render?: (scope: RenderSlotProps<DateFieldState>) => VNode[];
}

/** The `group` of the segments (spec/date-field.md, "Anatomy"). */
export const DateFieldInput: PublicComponent<
    { as?: AsProp },
    DateFieldInputSlots
> = publicComponent(
    defineComponent({
        name: "DateFieldInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(DateFieldKey, "DateField.Input");
            const children = (): VNodeChild[] => {
                const each = slots.default;
                return context.segments.value.flatMap(
                    (segment): VNodeChild[] =>
                        each
                            ? each({ segment })
                            : [
                                  h(DateFieldSegment, {
                                      key: segment.index,
                                      segment,
                                  }),
                              ],
                );
            };
            return () => {
                const aria = context.field.aria();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        role: "group",
                        "aria-labelledby": aria["aria-labelledby"],
                        "aria-describedby": aria["aria-describedby"],
                        "data-primitives-part": `${context.component}-input`,
                        ...context.attributes(),
                        ref: context.setInputElement,
                    },
                    children,
                );
            };
        },
    }),
);
