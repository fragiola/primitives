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
    type RegisteredItem,
    SelectContext,
    type SelectItemData,
} from "./select-context.ts";

export interface SelectRootProps extends OverlayRootProps {
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
    /**
     * Every item: the labels known while the list is closed. Without it, the Items register
     * themselves while mounted (keep the list mounted: `Portal keepMounted`).
     */
    items?: readonly SelectItemData[];
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /**
     * Locks the page's scroll and blocks the pointer outside while open (default `false`: the APG
     * select-only combobox is non-modal; spec/select.md, "Modal").
     */
    modal?: boolean;
    children?: ReactNode;
}

const NOOP = () => {};

/** Holds the select's state; renders its hidden form input (spec/select.md). */
export function SelectRoot({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    items: itemsProp,
    name,
    required = false,
    disabled: disabledProp = false,
    modal = false,
    children,
    ...overlayProps
}: SelectRootProps) {
    const root = useOverlayRoot(overlayProps);
    // without `items`, the Items register themselves (Base UI), in DOM order
    const [registered, setRegistered] = useState<readonly RegisteredItem[]>([]);
    const registerItem = useCallback((item: RegisteredItem) => {
        setRegistered((previous) =>
            [
                ...previous.filter((entry) => entry.element !== item.element),
                item,
            ].sort((a, b) =>
                a.element.compareDocumentPosition(b.element) &
                Node.DOCUMENT_POSITION_FOLLOWING
                    ? -1
                    : 1,
            ),
        );
        return () =>
            setRegistered((previous) =>
                previous.filter((entry) => entry !== item),
            );
    }, []);
    const items = itemsProp ?? registered;
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const input = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        // the trigger's rendered id: the consumer's, else the generated one
        id: root.trigger?.id || root.triggerId,
        labelable: true,
        value,
        filled: value !== null,
        input: () => input.current,
        focusTarget: () => root.trigger,
    });
    const disabled = disabledProp || field.disabled;
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const baseId = useId();
    const listId = `${baseId}-list`;
    const itemId = useCallback(
        (entry: string) =>
            `${baseId}-item-${items.findIndex((item) => item.value === entry)}`,
        [baseId, items],
    );
    const { setOpen } = root;
    const openOn = useCallback(
        (entry: string | null, reason: ChangeReason, event?: Event) => {
            if (setOpen(true, reason, event)) {
                setHighlighted(entry);
            }
        },
        [setOpen],
    );
    const choose = useCallback(
        (entry: string, reason: ChangeReason, event?: Event) => {
            const item = items.find((candidate) => candidate.value === entry);
            if (item === undefined || item.disabled) {
                return;
            }
            setValue(entry, { reason, event });
            setOpen(false, reason, event);
        },
        [items, setValue, setOpen],
    );

    const latest = useRef({
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
    });
    latest.current = {
        defaultValue,
        setValue,
        trigger: root.trigger,
        reset: field.reset,
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
                element.value = current.defaultValue ?? "";
            },
            invalid: () => latest.current.trigger,
        });
    }, []);

    const context = useMemo(
        () => ({
            ...root,
            field,
            items,
            registerItem: itemsProp === undefined ? registerItem : null,
            value,
            disabled,
            required,
            modal,
            highlighted,
            setHighlighted,
            openOn,
            choose,
            listId,
            itemId,
            placed,
            setPlaced,
        }),
        [
            root,
            field,
            items,
            itemsProp,
            registerItem,
            value,
            disabled,
            required,
            modal,
            highlighted,
            openOn,
            choose,
            listId,
            itemId,
            placed,
        ],
    );
    return (
        <SelectContext.Provider value={context}>
            {children}
            <input
                ref={input}
                aria-hidden="true"
                tabIndex={-1}
                name={field.name ?? name}
                value={value ?? ""}
                required={required}
                disabled={disabled}
                onChange={NOOP}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="select-input"
            />
        </SelectContext.Provider>
    );
}
