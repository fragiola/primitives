import {
    type CascadeItem,
    cascadeLevels,
    cascadePathItems,
} from "@fragiola/primitives/cascade";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import {
    type OverlayRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type CascadeSafeArea,
    CascadeSelectContext,
} from "./cascade-select-context.ts";

export interface CascadeSelectRootProps extends OverlayRootProps {
    /** The tree: an item with children is a parent, else a leaf. */
    items: readonly CascadeItem[];
    /** The chosen path, from the first level down (`[]`: none). */
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[], details: ChangeDetails) => void;
    /** A parent can be chosen too (spec/cascade-select.md, "Choosing"). */
    changeOnSelect?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /** Joins the path in the hidden input (default `"/"`). */
    valueSeparator?: string;
    children?: ReactNode;
}

const NOOP = () => {};
const NONE: readonly string[] = [];

/** Holds the cascading select's state; renders its hidden form input (spec/cascade-select.md). */
export function CascadeSelectRoot({
    items,
    value: valueProp,
    defaultValue = NONE,
    onValueChange,
    changeOnSelect = false,
    name,
    required = false,
    disabled: disabledProp = false,
    valueSeparator = "/",
    children,
    ...overlayProps
}: CascadeSelectRootProps) {
    const root = useOverlayRoot(overlayProps);
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const input = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        id: root.trigger?.id || root.triggerId,
        labelable: true,
        value,
        filled: value.length > 0,
        input: () => input.current,
        focusTarget: () => root.trigger,
    });
    const disabled = disabledProp || field.disabled;
    const [highlight, setHighlight] = useState<{
        active: readonly string[];
        peek: boolean;
    }>({ active: NONE, peek: false });
    const { active, peek } = highlight;
    const levels = useMemo(
        () => cascadeLevels(items, peek ? active : active.slice(0, -1)),
        [items, active, peek],
    );
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const safeArea = useRef<CascadeSafeArea | null>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );
    const baseId = useId();
    const levelId = useCallback(
        (depth: number) => `${baseId}-level-${depth}`,
        [baseId],
    );
    const itemId = useCallback(
        (depth: number, entry: string) =>
            `${baseId}-item-${depth}-${(levels[depth] ?? []).findIndex((item) => item.value === entry)}`,
        [baseId, levels],
    );
    const setActive = useCallback(
        (next: readonly string[], nextPeek = false) =>
            setHighlight({ active: next, peek: nextPeek }),
        [],
    );
    const { setOpen } = root;
    const openOn = useCallback(
        (next: readonly string[], reason: ChangeReason, event?: Event) => {
            if (setOpen(true, reason, event)) {
                setHighlight({ active: next, peek: false });
            }
        },
        [setOpen],
    );
    const choose = useCallback(
        (
            path: readonly string[],
            reason: ChangeReason,
            event?: Event,
            keepOpen = false,
        ) => {
            const found = cascadePathItems(items, path);
            if (
                found === null ||
                found.length === 0 ||
                found.some((item) => item.disabled)
            ) {
                return;
            }
            setValue(path, { reason, event });
            if (!keepOpen) {
                setOpen(false, reason, event);
            }
        },
        [items, setValue, setOpen],
    );
    // a closed popup drops its hover timer
    useEffect(() => {
        if (!root.open) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = undefined;
            safeArea.current = null;
        }
    }, [root.open]);

    const latest = useRef({
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
        valueSeparator,
    });
    latest.current = {
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
        valueSeparator,
    };
    useEffect(() => {
        const element = input.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const current = latest.current;
                current.reset();
                current.setValue(current.defaultValue, { reason: "none" });
                element.value = current.defaultValue.join(
                    current.valueSeparator,
                );
            },
            invalid: () => latest.current.trigger,
        });
    }, []);

    const context = useMemo(
        () => ({
            ...root,
            field,
            items,
            value,
            disabled,
            required,
            changeOnSelect,
            active,
            peek,
            levels,
            setActive,
            openOn,
            choose,
            levelId,
            itemId,
            safeArea,
            hoverTimer,
            placed,
            setPlaced,
        }),
        [
            root,
            field,
            items,
            value,
            disabled,
            required,
            changeOnSelect,
            active,
            peek,
            levels,
            setActive,
            openOn,
            choose,
            levelId,
            itemId,
            placed,
        ],
    );
    return (
        <CascadeSelectContext.Provider value={context}>
            {children}
            <input
                ref={input}
                aria-hidden="true"
                tabIndex={-1}
                name={field.name ?? name}
                value={value.join(valueSeparator)}
                required={required}
                disabled={disabled}
                onChange={NOOP}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="cascade-select-input"
            />
        </CascadeSelectContext.Provider>
    );
}
