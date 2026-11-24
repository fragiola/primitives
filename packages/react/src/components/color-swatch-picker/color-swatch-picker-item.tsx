import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { type MouseEvent, useId, useLayoutEffect, useMemo } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorSwatchPickerContext } from "./color-swatch-picker-context.ts";

export interface ColorSwatchPickerItemState {
    color: Color;
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export interface ColorSwatchPickerItemProps
    extends PartProps<ColorSwatchPickerItemState> {
    /** The color it selects. */
    value: Color | string;
    /** Takes focus, never the selection. */
    disabled?: boolean;
}

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** An `option` of the palette, focusable with a roving `tabindex` (spec/color-swatch-picker.md). */
export function ColorSwatchPickerItem({
    value,
    disabled: disabledProp = false,
    ...props
}: ColorSwatchPickerItemProps) {
    const context = useRequiredContext(
        ColorSwatchPickerContext,
        "ColorSwatchPicker.Item",
    );
    const color = useMemo(() => parseColor(value) ?? BLACK, [value]);
    const key = formatColor(color, "hexa");
    const [element, ref] = useElement<HTMLElement>();
    const id = useId();
    const { register } = context;
    useLayoutEffect(
        () =>
            element === null
                ? undefined
                : register({ element, key, color, disabled: disabledProp }),
        [element, key, color, disabledProp, register],
    );
    const disabled = disabledProp || context.disabled;
    const selected = context.selected === key;
    const highlighted = element !== null && context.highlighted === element;
    return renderElement(
        "div",
        props,
        { color, selected, highlighted, disabled },
        {
            role: "option",
            id,
            // a disabled list's options take no focus at all
            tabIndex: context.disabled
                ? undefined
                : element !== null && context.tabStop === element
                  ? 0
                  : -1,
            "aria-selected": selected ? "true" : "false",
            "aria-disabled": disabled ? "true" : undefined,
            style: {
                "--color-swatch-picker-item-color": formatColor(color, "css"),
            },
            "data-primitives-part": "color-swatch-picker-item",
            ...stateAttributes({ selected, highlighted, disabled }),
            onFocus: () => {
                if (element !== null) {
                    context.focused(element);
                }
            },
            onClick: (event: MouseEvent) => {
                if (element !== null) {
                    context.press(element, event.nativeEvent);
                }
            },
        },
        ref,
    );
}
