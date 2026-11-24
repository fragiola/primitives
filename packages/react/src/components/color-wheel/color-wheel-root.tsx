import {
    type Color,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    hueAtPoint,
    isOnColorWheel,
    isSameColor,
    parseColor,
    setColorChannel,
    wrapHue,
} from "@fragiola/primitives/color";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    type PointerEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useColorPickerBinding } from "../../hooks/use-color-picker-binding.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorWheelContext,
    type ColorWheelState,
    colorWheelState,
} from "./color-wheel-context.ts";

const RED: Color = {
    space: "hsl",
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string | undefined): Color | undefined {
    return value === undefined ? undefined : (parseColor(value) ?? RED);
}

export interface ColorWheelRootProps extends PartProps<ColorWheelState> {
    value?: Color | string;
    defaultValue?: Color | string;
    onValueChange?: (value: Color, details: ChangeDetails) => void;
    /** When a drag ends, or after a key changed the value. */
    onValueCommit?: (value: Color, details: ChangeDetails) => void;
    /** The space of the hue (default: the value's, else hsb). */
    colorSpace?: "hsl" | "hsb";
    /** The ring's outer radius, in px (default 100). */
    outerRadius?: number;
    /** The ring's inner radius, in px (default 75). */
    innerRadius?: number;
    disabled?: boolean;
    name?: string;
    /** The locale of the hue's text (BCP 47; default: the runtime's). */
    locale?: string;
}

/**
 * Holds a color wheel's value: the interactive square around the ring, and the hidden input with
 * the color as hex (spec/color-wheel.md, the APG slider on a ring).
 */
export function ColorWheelRoot({
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange,
    onValueCommit,
    colorSpace,
    outerRadius = 100,
    innerRadius = 75,
    disabled: disabledProp = false,
    name,
    locale,
    children,
    ...props
}: ColorWheelRootProps) {
    const defaultValue = defaultValueProp ?? RED;
    // inside a ColorPicker, bound to its color unless given its own (spec/color-picker.md)
    const { picker, bound } = useColorPickerBinding(
        valueProp !== undefined || defaultValueProp !== undefined,
    );
    const disabled = disabledProp || (picker?.disabled ?? false);
    const [own, setOwn] = useControllableState<Color, ChangeDetails>(
        toColor(valueProp),
        toColor(defaultValue) as Color,
        onValueChange,
    );
    const current = bound === null ? own : bound.value;
    const setCurrent =
        bound === null
            ? setOwn
            : (next: Color, details: ChangeDetails) => {
                  onValueChange?.(next, details);
                  bound.setValue(next, details);
              };
    const color = convertColor(
        current,
        colorSpaceFor("hue", current, colorSpace),
    );
    const hue = getColorChannel(color, "hue");
    const hex = formatColor(color, "hex");
    const input = useRef<HTMLInputElement>(null);
    const [thumb, setThumb] = useState<HTMLElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const endDrag = useRef<(() => void) | null>(null);
    useEffect(() => () => endDrag.current?.(), []);

    const latest = useRef({
        current,
        color,
        innerRadius,
        outerRadius,
        onValueCommit,
        setCurrent,
        bound,
    });
    latest.current = {
        current,
        color,
        innerRadius,
        outerRadius,
        onValueCommit,
        setCurrent,
        bound,
    };

    // a form reset returns the wheel to its default (spec/color-wheel.md, "Forms")
    const initial = useRef(defaultValue);
    initial.current = defaultValue;
    useEffect(() => {
        const element = input.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                // a bound control is reset by its picker
                if (latest.current.bound !== null) {
                    return;
                }
                const next = toColor(initial.current) as Color;
                if (!isSameColor(next, latest.current.current)) {
                    latest.current.setCurrent(next, { reason: "none" });
                }
            },
        });
    }, []);

    const setHue = useCallback((next: number, reason: ChangeReason) => {
        const before = latest.current.color;
        const wrapped = wrapHue(next);
        if (wrapped === getColorChannel(before, "hue")) {
            return before;
        }
        const changed = setColorChannel(before, "hue", wrapped);
        latest.current.setCurrent(changed, { reason });
        return changed;
    }, []);
    const commit = useCallback((committed?: Color) => {
        const {
            color: now,
            onValueCommit: onCommit,
            bound: to,
        } = latest.current;
        onCommit?.(committed ?? now, { reason: "none" });
        to?.commit(committed ?? now, { reason: "none" });
    }, []);

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (disabled || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
        }
        const target = event.currentTarget;
        const point = { x: event.clientX, y: event.clientY };
        const box = target.getBoundingClientRect();
        // a press off the ring does nothing (spec/color-wheel.md, "Pointer")
        if (
            !isOnColorWheel(
                box,
                point,
                latest.current.innerRadius,
                latest.current.outerRadius,
            )
        ) {
            return;
        }
        event.preventDefault();
        setHue(hueAtPoint(box, point), "track-press");
        thumb?.focus();
        setDragging(true);
        endDrag.current?.();
        endDrag.current = startDrag(target, event.nativeEvent, {
            onMove: (move) =>
                setHue(
                    hueAtPoint(target.getBoundingClientRect(), {
                        x: move.clientX,
                        y: move.clientY,
                    }),
                    "drag",
                ),
            onEnd: () => {
                endDrag.current = null;
                setDragging(false);
                commit();
            },
        });
    };

    const valueText = formatColorChannel(color, "hue", locale, hue);
    const context = useMemo(
        () => ({
            color,
            hue,
            outerRadius,
            innerRadius,
            disabled,
            dragging,
            valueText,
            setHue,
            commit,
            thumb,
            setThumb,
        }),
        [
            color,
            hue,
            outerRadius,
            innerRadius,
            disabled,
            dragging,
            valueText,
            setHue,
            commit,
            thumb,
        ],
    );
    const size = `${outerRadius * 2}px`;
    return (
        <ColorWheelContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {children}
                            <input
                                ref={input}
                                type="hidden"
                                name={bound === null ? name : undefined}
                                value={hex}
                                data-primitives-part="color-wheel-input"
                            />
                        </>
                    ),
                },
                colorWheelState(context),
                {
                    "data-primitives-part": "color-wheel-root",
                    ...stateAttributes({ disabled, dragging }),
                    // structural: the square around the ring, no page scroll under a touch drag,
                    // the radii a recipe's ring mask reads
                    style: {
                        position: "relative",
                        inlineSize: size,
                        blockSize: size,
                        touchAction: "none",
                        "--color-wheel-outer-radius": `${outerRadius}px`,
                        "--color-wheel-inner-radius": `${innerRadius}px`,
                    },
                    onPointerDown,
                },
            )}
        </ColorWheelContext.Provider>
    );
}
