import {
    type Color,
    type ColorSpace,
    convertColor,
    formatColor,
    isSameColor,
    parseColor,
} from "@fragiola/primitives/color";
import { getTabbables } from "@fragiola/primitives/focus";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    h,
    type InjectionKey,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { ColorPickerBindingKey } from "../../utils/color-picker-binding.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type FieldContext, FieldKey } from "../field/field-context.ts";
import {
    type ColorPickerFormat,
    ColorPickerKey,
    type ColorPickerState,
} from "./color-picker-context.ts";
import { colorPickerElement } from "./color-picker-element.ts";

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string): Color {
    return parseColor(value) ?? BLACK;
}

/** The space a format edits in (`hex`: rgb). */
function formatSpace(format: ColorPickerFormat): ColorSpace {
    return format === "hex" ? "rgb" : format;
}

export interface ColorPickerRootProps {
    value?: Color | string;
    defaultValue?: Color | string;
    format?: ColorPickerFormat;
    defaultFormat?: ColorPickerFormat;
    /** Every control inside is disabled. */
    disabled?: boolean;
    name?: string;
}

export type ColorPickerRootEmits = {
    "update:value": (value: Color) => true;
    /** The color, as the control that changed it reports it. */
    valueChange: (value: Color, details: ChangeDetails) => true;
    /** Once a control's change is complete (a drag ended, a key, a commit, a choice, a pick). */
    valueCommit: (value: Color, details: ChangeDetails) => true;
    "update:format": (format: ColorPickerFormat) => true;
    formatChange: (format: ColorPickerFormat, details: ChangeDetails) => true;
};

/**
 * Holds one color (`v-model:value`) and shares it with the color controls inside it
 * (spec/color-picker.md): a `group` with its format (`v-model:format`), its form value as hex and
 * its Field binding.
 */
export const ColorPickerRoot: PartComponent<
    ColorPickerRootProps,
    ColorPickerState,
    ColorPickerRootEmits
> = publicComponent(
    defineComponent({
        name: "ColorPickerRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, String] as PropType<Color | string>,
                default: undefined,
            },
            defaultValue: {
                type: [Object, String] as PropType<Color | string>,
                default: "#000000",
            },
            format: {
                type: String as PropType<ColorPickerFormat>,
                default: undefined,
            },
            defaultFormat: {
                type: String as PropType<ColorPickerFormat>,
                default: "hex",
            },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: Color) => true,
            valueChange: (_value: Color, _details: ChangeDetails) => true,
            valueCommit: (_value: Color, _details: ChangeDetails) => true,
            "update:format": (_format: ColorPickerFormat) => true,
            formatChange: (
                _format: ColorPickerFormat,
                _details: ChangeDetails,
            ) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const value = useControllable<Color, ChangeDetails>(
                () =>
                    props.value === undefined
                        ? undefined
                        : toColor(props.value),
                toColor(props.defaultValue),
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const format = useControllable<ColorPickerFormat, ChangeDetails>(
                () => props.format,
                props.defaultFormat,
                (next, details) => {
                    emit("update:format", next);
                    emit("formatChange", next, details);
                },
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = colorPickerElement(element);
            const hidden = shallowRef<HTMLInputElement | null>(null);
            const hex = computed(() => formatColor(value.value.value, "hex"));
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => hex.value,
                // a picker always has a color
                filled: () => true,
                input: () => hidden.value,
                element: () => element.value,
                focusTarget: () =>
                    element.value === null
                        ? null
                        : (getTabbables(element.value)[0] ?? null),
            });
            const disabled = () => props.disabled || field.disabled();
            // the controls inside read no Field: the picker is the field's control
            // (spec/color-picker.md, "Sharing the color")
            provide(FieldKey as InjectionKey<FieldContext | null>, null);
            const commit = (color: Color, details: ChangeDetails) => {
                emit("valueCommit", color, details);
            };
            provide(ColorPickerBindingKey, {
                value: () => value.value.value,
                setValue: (color, details) => value.set(color, details),
                commit,
                disabled,
            });
            const state = (): ColorPickerState => ({
                color: value.value.value,
                format: format.value.value,
                disabled: disabled(),
            });
            provide(ColorPickerKey, {
                state,
                root: element,
                setFormat(next: ColorPickerFormat, event: Event) {
                    const details = { reason: "input-change" as const, event };
                    format.set(next, details);
                    const now = value.value.value;
                    const space = formatSpace(next);
                    if (now.space !== space) {
                        value.set(convertColor(now, space), details);
                    }
                },
                pick(picked: Color, event: Event | undefined) {
                    const now = value.value.value;
                    const next = convertColor(
                        { ...picked, alpha: now.alpha },
                        now.space,
                    );
                    const details = { reason: "trigger-press" as const, event };
                    value.set(next, details);
                    commit(next, details);
                },
            });

            // a form reset returns the picker to its default, and every bound control with it
            watch(
                hidden,
                (input, _, onCleanup) => {
                    if (input === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(input, {
                            reset: () => {
                                const next = toColor(props.defaultValue);
                                if (!isSameColor(next, value.value.value)) {
                                    field.reset();
                                    value.set(next, { reason: "none" });
                                }
                            },
                        }),
                    );
                },
                { flush: "post" },
            );

            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    field.onBlur();
                }
            };
            const setHidden = (node: unknown) => {
                hidden.value = node as HTMLInputElement | null;
            };
            return () => {
                const current = state();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    current,
                    {
                        role: "group",
                        ...field.aria(),
                        style: {
                            "--color-picker-color": formatColor(
                                current.color,
                                "css",
                            ),
                        },
                        "data-primitives-part": "color-picker-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            format: current.format,
                            disabled: current.disabled,
                        }),
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        slots.default?.({ state: current }),
                        h("input", {
                            ref: setHidden,
                            type: "hidden",
                            name: field.name() ?? props.name,
                            value: hex.value,
                            disabled: current.disabled,
                            "data-primitives-part": "color-picker-input",
                        }),
                    ],
                );
            };
        },
    }),
);
