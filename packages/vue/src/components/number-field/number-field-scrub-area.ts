import { watchScrub } from "@fragiola/primitives/number";
import { defineComponent, type PropType, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    NumberFieldKey,
    type NumberFieldState,
} from "./number-field-context.ts";

export interface NumberFieldScrubAreaProps {
    /** The axis the pointer scrubs along (default `"horizontal"`). */
    direction?: "horizontal" | "vertical";
    /** The pixels one step takes (default `2`). */
    pixelSensitivity?: number;
}

const STYLE = { touchAction: "none", userSelect: "none" } as const;

/** A press dragged along it steps the value (spec/number-field.md, "Pointer": scrub). */
export const NumberFieldScrubArea: PartComponent<
    NumberFieldScrubAreaProps,
    NumberFieldState
> = publicComponent(
    defineComponent({
        name: "NumberFieldScrubArea",
        inheritAttrs: false,
        props: {
            ...asProp,
            direction: {
                type: String as PropType<"horizontal" | "vertical">,
                default: "horizontal",
            },
            pixelSensitivity: { type: Number, default: 2 },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NumberFieldKey,
                "NumberField.ScrubArea",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            watch(
                [element, () => props.direction, () => props.pixelSensitivity],
                ([area, direction, pixelSensitivity], _, onCleanup) => {
                    if (area === null) {
                        return;
                    }
                    onCleanup(
                        watchScrub(area, {
                            direction,
                            pixelSensitivity,
                            onStart: () => {
                                const { disabled, readOnly } =
                                    context.state.value;
                                if (disabled || readOnly) {
                                    return false;
                                }
                                context.scrubbing.value = true;
                                return true;
                            },
                            onScrub: (steps, event) => {
                                const amount = context.amount(event);
                                context.stepBy(
                                    steps > 0 ? amount : -amount,
                                    "scrub",
                                    event,
                                    Math.abs(steps),
                                );
                            },
                            onEnd: (event) => {
                                context.scrubbing.value = false;
                                context.commit(event);
                            },
                            onCursor: (point) => {
                                context.cursor.value = point;
                            },
                        }),
                    );
                },
                { flush: "post" },
            );
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        style: STYLE,
                        // a press keeps the focus where it is
                        onMousedown: (event: MouseEvent) => {
                            if (event.button === 0) {
                                event.preventDefault();
                            }
                        },
                        "data-primitives-part": "number-field-scrub-area",
                        ...context.attributes(),
                        ref: setElement,
                    },
                );
        },
    }),
);
