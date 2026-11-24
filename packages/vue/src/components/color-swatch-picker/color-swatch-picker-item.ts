import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    shallowRef,
    useId,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorSwatchPickerKey } from "./color-swatch-picker-context.ts";

export interface ColorSwatchPickerItemState {
    color: Color;
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export interface ColorSwatchPickerItemProps {
    /** The color it selects. */
    value: Color | string;
    /** Takes focus, never the selection. */
    disabled?: boolean;
}

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** An `option` of the palette, focusable with a roving `tabindex` (spec/color-swatch-picker.md). */
export const ColorSwatchPickerItem: PartComponent<
    ColorSwatchPickerItemProps,
    ColorSwatchPickerItemState
> = publicComponent(
    defineComponent({
        name: "ColorSwatchPickerItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, String] as PropType<Color | string>,
                required: true,
            },
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ColorSwatchPickerKey,
                "ColorSwatchPicker.Item",
            );
            const color = computed(() => parseColor(props.value) ?? BLACK);
            const key = computed(() => formatColor(color.value, "hexa"));
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const id = useId();
            let unregister: (() => void) | null = null;
            onMounted(() => {
                const node = element.value;
                if (node !== null) {
                    unregister = context.register({
                        element: node,
                        key: () => key.value,
                        color: () => color.value,
                        disabled: () => props.disabled,
                    });
                }
            });
            onBeforeUnmount(() => {
                unregister?.();
                unregister = null;
            });
            const state = computed<ColorSwatchPickerItemState>(() => ({
                color: color.value,
                selected: context.selected.value === key.value,
                highlighted:
                    element.value !== null &&
                    context.highlighted.value === element.value,
                disabled: props.disabled || context.disabled(),
            }));
            return () => {
                const { selected, highlighted, disabled } = state.value;
                const node = element.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        role: "option",
                        id,
                        // a disabled list's options take no focus at all
                        tabindex: context.disabled()
                            ? undefined
                            : node !== null && context.tabStop.value === node
                              ? 0
                              : -1,
                        "aria-selected": selected ? "true" : "false",
                        "aria-disabled": disabled ? "true" : undefined,
                        style: {
                            "--color-swatch-picker-item-color": formatColor(
                                color.value,
                                "css",
                            ),
                        },
                        "data-primitives-part": "color-swatch-picker-item",
                        ...stateAttributes({ selected, highlighted, disabled }),
                        onFocus: () => {
                            if (element.value !== null) {
                                context.focused(element.value);
                            }
                        },
                        onClick: (event: MouseEvent) => {
                            if (element.value !== null) {
                                context.press(element.value, event);
                            }
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
