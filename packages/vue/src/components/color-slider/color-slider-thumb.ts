import { formatColor, setColorChannel } from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { sliderKeyTarget, valueToPercent } from "@fragiola/primitives/range";
import {
    defineComponent,
    onBeforeUnmount,
    shallowRef,
    useId,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorSliderKey,
    type ColorSliderState,
    colorSliderAttributes,
    colorSliderState,
} from "./color-slider-context.ts";

export interface ColorSliderThumbProps {
    /** Generated unless given (the Output's `for`). */
    id?: string;
}

/** The `slider`: the channel's value (spec/color-slider.md). */
export const ColorSliderThumb: PartComponent<
    ColorSliderThumbProps,
    ColorSliderState
> = publicComponent(
    defineComponent({
        name: "ColorSliderThumb",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Generated unless given (the Output's `for`). */
            id: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorSliderKey,
                "ColorSlider.Thumb",
            );
            const direction = useProvidedDirection();
            const generated = useId();
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            watch(
                element,
                (node) => {
                    context.thumb.value = node;
                },
                { flush: "post" },
            );
            onBeforeUnmount(() => {
                if (context.thumb.value === element.value) {
                    context.thumb.value = null;
                }
            });

            // a DirectionProvider's direction, else the computed one (spec/direction.md)
            const rtl = () => {
                const provided = direction();
                return provided !== null
                    ? provided === "rtl"
                    : element.value !== null &&
                          getDirection(element.value) === "rtl";
            };

            const onKeydown = (event: KeyboardEvent) => {
                if (context.disabled()) {
                    return;
                }
                const range = context.range.value;
                const target = sliderKeyTarget(
                    event.key,
                    event.shiftKey,
                    context.value.value,
                    {
                        step: range.step,
                        largeStep: range.largeStep,
                        min: range.min,
                        max: range.max,
                        orientation: context.orientation(),
                        rtl: rtl(),
                    },
                );
                if (target === null) {
                    return;
                }
                event.preventDefault();
                context.commit(context.setChannelValue(target, "keyboard"));
            };

            return () => {
                const { field } = context;
                const value = context.value.value;
                const range = context.range.value;
                const disabled = context.disabled();
                const orientation = context.orientation();
                // the centring translate is physical: the layout's (computed) direction
                // (Slider's Thumb)
                const layoutRtl =
                    element.value !== null &&
                    getDirection(element.value) === "rtl";
                const percent = valueToPercent(value, range.min, range.max);
                const thumbColor = formatColor(
                    context.channel() === "alpha"
                        ? context.color.value
                        : setColorChannel(context.color.value, "alpha", 1),
                );
                // structural: the thumb's centre on its value, and its color for the recipe
                const style =
                    orientation === "vertical"
                        ? {
                              position: "absolute",
                              insetBlockEnd: `${percent}%`,
                              left: "50%",
                              translate: "-50% 50%",
                              "--color-slider-thumb-color": thumbColor,
                          }
                        : {
                              position: "absolute",
                              insetInlineStart: `${percent}%`,
                              top: "50%",
                              translate: layoutRtl ? "50% -50%" : "-50% -50%",
                              "--color-slider-thumb-color": thumbColor,
                          };
                // the field's label (else the slider's Label) names a thumb that has no name of
                // its own
                const named =
                    attrs["aria-label"] !== undefined ||
                    attrs["aria-labelledby"] !== undefined;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    colorSliderState(context),
                    {
                        role: "slider",
                        id: props.id ?? generated,
                        tabindex: disabled ? undefined : 0,
                        "aria-valuenow": value,
                        "aria-valuemin": range.min,
                        "aria-valuemax": range.max,
                        "aria-valuetext": context.valueText.value,
                        "aria-orientation": orientation,
                        "aria-disabled": disabled ? "true" : undefined,
                        ...field.aria(),
                        "aria-labelledby": named
                            ? undefined
                            : (field.aria()["aria-labelledby"] ??
                              context.labelId.value),
                        "data-primitives-part": "color-slider-thumb",
                        ...stateAttributes(
                            colorSliderAttributes(context, true),
                        ),
                        style,
                        onKeydown,
                        onFocus: field.onFocus,
                        onBlur: field.onBlur,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
