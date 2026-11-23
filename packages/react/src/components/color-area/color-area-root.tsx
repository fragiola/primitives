import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    colorAreaBackground,
    colorAreaChannels,
    colorChannelRange,
    convertColor,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { bridgeForm } from "@fragiola/primitives/form";
import { startDrag } from "@fragiola/primitives/pointer";
import {
    fractionAlong,
    snapToStep,
    valueAtFraction,
} from "@fragiola/primitives/range";
import {
    type PointerEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type ColorAreaAxis,
    ColorAreaContext,
    type ColorAreaState,
    colorAreaState,
} from "./color-area-context.ts";

const WHITE_HUE: Color = {
    space: "hsb",
    hue: 0,
    saturation: 100,
    brightness: 100,
    alpha: 1,
};

/** A `Color`, or a string `parseColor` reads (the default when it reads none). */
function toColor(value: Color | string | undefined): Color | undefined {
    return value === undefined ? undefined : (parseColor(value) ?? WHITE_HUE);
}

export interface ColorAreaRootProps extends PartProps<ColorAreaState> {
    value?: Color | string;
    defaultValue?: Color | string;
    onValueChange?: (value: Color, details: ChangeDetails) => void;
    /** When a drag ends, or after a key changed the value. */
    onValueCommit?: (value: Color, details: ChangeDetails) => void;
    xChannel?: ColorChannel;
    yChannel?: ColorChannel;
    colorSpace?: ColorSpace;
    disabled?: boolean;
    /** The locale of the channels' text (BCP 47; default: the runtime's). */
    locale?: string;
}

/**
 * Holds a color area's value: the `group` the consumer names, the interactive area and its
 * background (spec/color-area.md: two APG sliders, one native range input per axis).
 */
export function ColorAreaRoot({
    value: valueProp,
    defaultValue = WHITE_HUE,
    onValueChange,
    onValueCommit,
    xChannel: xChannelProp,
    yChannel: yChannelProp,
    colorSpace,
    disabled = false,
    locale,
    children,
    ...props
}: ColorAreaRootProps) {
    const direction = useContext(DirectionContext);
    const [current, setCurrent] = useControllableState<Color, ChangeDetails>(
        toColor(valueProp),
        toColor(defaultValue) as Color,
        onValueChange,
    );
    const { space, xChannel, yChannel } = colorAreaChannels(current, {
        xChannel: xChannelProp,
        yChannel: yChannelProp,
        colorSpace,
    });
    const color = convertColor(current, space);
    const xValue = getColorChannel(color, xChannel);
    const yValue = getColorChannel(color, yChannel);
    const xRange = colorChannelRange(xChannel);
    const yRange = colorChannelRange(yChannel);
    const [element, ref] = useElement<HTMLElement>();
    const [dragging, setDragging] = useState(false);
    const [activeAxis, setActiveAxis] = useState<ColorAreaAxis>("x");
    const [inputs, setInputs] = useState<
        Record<ColorAreaAxis, HTMLInputElement | null>
    >({ x: null, y: null });
    const endDrag = useRef<(() => void) | null>(null);
    useEffect(() => () => endDrag.current?.(), []);

    const latest = useRef({
        current,
        color,
        xChannel,
        yChannel,
        activeAxis,
        inputs,
        disabled,
        onValueCommit,
        setCurrent,
    });
    latest.current = {
        current,
        color,
        xChannel,
        yChannel,
        activeAxis,
        inputs,
        disabled,
        onValueCommit,
        setCurrent,
    };
    const provided = useRef(direction);
    provided.current = direction;

    const setValues = useCallback(
        (values: { x?: number; y?: number }, reason: ChangeReason) => {
            const { color: before, xChannel: x, yChannel: y } = latest.current;
            let next = before;
            if (values.x !== undefined) {
                next = setColorChannel(
                    next,
                    x,
                    snapToStep(values.x, colorChannelRange(x)),
                );
            }
            if (values.y !== undefined) {
                next = setColorChannel(
                    next,
                    y,
                    snapToStep(values.y, colorChannelRange(y)),
                );
            }
            if (isSameColor(next, before)) {
                return before;
            }
            latest.current.setCurrent(next, { reason });
            return next;
        },
        [],
    );
    const commit = useCallback((committed?: Color) => {
        const { color: now, onValueCommit: onCommit } = latest.current;
        onCommit?.(committed ?? now, { reason: "none" });
    }, []);
    const registerInput = useCallback(
        (axis: ColorAreaAxis, input: HTMLInputElement | null) =>
            setInputs((list) =>
                list[axis] === input ? list : { ...list, [axis]: input },
            ),
        [],
    );

    // a form reset returns the area to its default (spec/color-area.md, "Forms")
    const initial = useRef(defaultValue);
    initial.current = defaultValue;
    const first = inputs.x ?? inputs.y;
    useEffect(() => {
        if (first === null) {
            return undefined;
        }
        return bridgeForm(first, {
            reset: () => {
                const next = toColor(initial.current) as Color;
                if (!isSameColor(next, latest.current.current)) {
                    latest.current.setCurrent(next, { reason: "none" });
                }
            },
        });
    }, [first]);

    const rtl =
        direction !== null
            ? direction === "rtl"
            : element !== null && getDirection(element) === "rtl";
    const background = colorAreaBackground(color, xChannel, yChannel, rtl);

    const valuesAt = (target: HTMLElement, x: number, y: number) => {
        const box = target.getBoundingClientRect();
        const point = { x, y };
        const { xChannel: xc, yChannel: yc } = latest.current;
        return {
            x: valueAtFraction(
                fractionAlong(
                    box,
                    point,
                    "horizontal",
                    getDirection(target, provided.current) === "rtl",
                ),
                colorChannelRange(xc),
            ),
            y: valueAtFraction(
                fractionAlong(box, point, "vertical", false),
                colorChannelRange(yc),
            ),
        };
    };

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        if (disabled || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
        }
        event.preventDefault();
        const target = event.currentTarget;
        setValues(
            valuesAt(target, event.clientX, event.clientY),
            "track-press",
        );
        const { inputs: list, activeAxis: axis } = latest.current;
        (list[axis] ?? list.x)?.focus();
        setDragging(true);
        endDrag.current?.();
        endDrag.current = startDrag(target, event.nativeEvent, {
            onMove: (move) =>
                setValues(valuesAt(target, move.clientX, move.clientY), "drag"),
            onEnd: () => {
                endDrag.current = null;
                setDragging(false);
                commit();
            },
        });
    };

    const context = useMemo(
        () => ({
            color,
            space,
            xChannel,
            yChannel,
            xValue,
            yValue,
            xRange,
            yRange,
            disabled,
            dragging,
            locale,
            activeAxis,
            setActiveAxis,
            setValues,
            commit,
            inputs,
            registerInput,
        }),
        [
            color,
            space,
            xChannel,
            yChannel,
            xValue,
            yValue,
            xRange,
            yRange,
            disabled,
            dragging,
            locale,
            activeAxis,
            setValues,
            commit,
            inputs,
            registerInput,
        ],
    );
    return (
        <ColorAreaContext.Provider value={context}>
            {renderElement(
                "div",
                { ...props, children },
                colorAreaState(context),
                {
                    role: "group",
                    "data-primitives-part": "color-area-root",
                    ...stateAttributes({ disabled, dragging }),
                    // structural: the thumb's box, no page scroll under a touch drag, the
                    // background a recipe draws
                    style: {
                        position: "relative",
                        touchAction: "none",
                        "--color-area-background": background.backgroundImage,
                        "--color-area-background-blend-mode":
                            background.backgroundBlendMode,
                    },
                    onPointerDown,
                },
                ref,
            )}
        </ColorAreaContext.Provider>
    );
}
