import {
    colorAreaKeyTarget,
    formatColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
import {
    defineComponent,
    onBeforeUnmount,
    type PropType,
    shallowRef,
    watch,
} from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type ColorAreaAxis,
    ColorAreaKey,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

export interface ColorAreaInputProps {
    /** The axis this slider is: `x` or `y`. */
    axis: ColorAreaAxis;
    /** What the form submits its channel's value as. */
    name?: string;
}

/**
 * One axis's `slider`: a native range input, visually hidden in the Thumb; every key moves the
 * axis it names, and the focus follows it (spec/color-area.md, "Keyboard").
 */
export const ColorAreaInput: PartComponent<
    ColorAreaInputProps,
    ColorAreaState
> = publicComponent(
    defineComponent({
        name: "ColorAreaInput",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** The axis this slider is: `x` or `y`. */
            axis: {
                type: String as PropType<ColorAreaAxis>,
                required: true,
            },
            /** What the form submits its channel's value as. */
            name: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ColorAreaKey, "ColorArea.Input");
            const direction = useProvidedDirection();
            const element = shallowRef<HTMLInputElement | null>(null);
            const setElement = (value: unknown) => {
                const next =
                    value instanceof HTMLInputElement
                        ? value
                        : ((value as { $el?: HTMLInputElement } | null)?.$el ??
                          null);
                if (element.value !== next) {
                    element.value = next;
                }
            };
            watch(
                [element, () => props.axis],
                ([node, axis], _, onCleanup) => {
                    context.registerInput(axis, node);
                    onCleanup(() => {
                        if (context.inputs.value[axis] === node) {
                            context.registerInput(axis, null);
                        }
                    });
                },
                { flush: "post" },
            );
            onBeforeUnmount(() => {
                if (context.inputs.value[props.axis] === element.value) {
                    context.registerInput(props.axis, null);
                }
            });

            const onKeydown = (event: KeyboardEvent) => {
                if (context.disabled()) {
                    return;
                }
                const rtl =
                    getDirection(
                        event.currentTarget as HTMLElement,
                        direction(),
                    ) === "rtl";
                const target = colorAreaKeyTarget(event.key, event.shiftKey, {
                    x: context.xValue.value,
                    y: context.yValue.value,
                    xRange: context.xRange(),
                    yRange: context.yRange(),
                    rtl,
                });
                if (target === null) {
                    return;
                }
                // the native range keys never run
                event.preventDefault();
                const color = context.setValues(
                    { [target.axis]: target.value },
                    "keyboard",
                );
                context.commit(color);
                if (target.axis !== props.axis) {
                    // the focus follows the axis the key moved
                    context.inputs.value[target.axis]?.focus();
                }
            };
            // an assistive technology's own change of the slider
            const onInput = (event: Event) => {
                const color = context.setValues(
                    {
                        [props.axis]: Number(
                            (event.currentTarget as HTMLInputElement).value,
                        ),
                    },
                    "keyboard",
                );
                context.commit(color);
            };
            const onFocus = () => {
                context.activeAxis.value = props.axis;
            };

            return () => {
                const { axis } = props;
                const channel =
                    axis === "x" ? context.xChannel() : context.yChannel();
                const range =
                    axis === "x" ? context.xRange() : context.yRange();
                const value =
                    axis === "x" ? context.xValue.value : context.yValue.value;
                const disabled = context.disabled();
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    colorAreaState(context),
                    {
                        type: "range",
                        min: range.min,
                        max: range.max,
                        step: range.step,
                        value: String(value),
                        "aria-valuetext": formatColorChannel(
                            context.color.value,
                            channel,
                            context.locale(),
                            value,
                        ),
                        "aria-orientation":
                            axis === "x" ? "horizontal" : "vertical",
                        tabindex: context.activeAxis.value === axis ? 0 : -1,
                        disabled,
                        name: props.name,
                        "data-primitives-part": "color-area-input",
                        ...stateAttributes({ axis, channel, disabled }),
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        onKeydown,
                        onInput,
                        onFocus,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
