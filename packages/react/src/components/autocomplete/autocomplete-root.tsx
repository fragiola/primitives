import {
    containsFilter,
    filterItems,
    type ItemFilter,
    type ItemGroup,
    itemLabel,
} from "@fragiola/primitives/collection";
import { bridgeForm } from "@fragiola/primitives/form";
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
    AutocompleteContext,
    type AutocompleteItemInfo,
    type AutocompleteMode,
    type AutocompletePending,
    type AutocompleteShown,
} from "./autocomplete-context.ts";

export interface AutocompleteRootProps<Item> extends OverlayRootProps {
    /** The text (controlled). */
    value?: string;
    /** The text at first (default `""`). */
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    /** The suggestions, or groups of them: the autocomplete filters them (`list`, `both`). */
    items?: readonly (Item | ItemGroup<Item>)[];
    /** `list` (default), `both`, `inline` or `none` (spec/autocomplete.md). */
    mode?: AutocompleteMode;
    /** Whether a suggestion matches the query; `null` turns filtering off. */
    filter?: ItemFilter<Item> | null;
    /** The most suggestions the list renders; `-1` for no limit. */
    limit?: number;
    locale?: string;
    /** A suggestion's text, written into the input when chosen. */
    itemToStringValue?: (item: Item) => string;
    /** A press on the input opens the list (default `false`). */
    openOnInputClick?: boolean;
    /** Typing highlights the first suggestion (`list`, `none`; default `false`). */
    autoHighlight?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    children?: ReactNode;
}

const NONE: readonly unknown[] = [];

/** Holds the autocomplete's state (spec/autocomplete.md): the value is the text. */
export function AutocompleteRoot<Item>(props: AutocompleteRootProps<Item>) {
    const {
        items,
        mode = "list",
        filter: filterProp,
        limit = -1,
        locale,
        itemToStringValue,
        openOnInputClick = false,
        autoHighlight = false,
        name,
        required = false,
        disabled: disabledProp = false,
        children,
        open: openProp,
        defaultOpen,
        onOpenChange,
        onOpenChangeComplete,
        actionsRef,
    } = props;
    const defaultValue = props.defaultValue ?? "";
    const root = useOverlayRoot({
        open: openProp,
        defaultOpen,
        onOpenChange,
        onOpenChangeComplete,
        actionsRef,
    });
    const [value, setValue] = useControllableState<string, ChangeDetails>(
        props.value,
        defaultValue,
        props.onValueChange,
    );
    const label = useCallback(
        (item: unknown) =>
            itemLabel(
                item,
                itemToStringValue as ((item: unknown) => string) | undefined,
            ),
        [itemToStringValue],
    );
    const inline = mode === "both" || mode === "inline";
    const filters = mode === "list" || mode === "both";

    const field = useFieldControl({
        id: root.trigger?.id || root.triggerId,
        labelable: true,
        value,
        filled: value !== "",
        input: () => root.trigger as HTMLInputElement | null,
        focusTarget: () => root.trigger,
    });
    const disabled = disabledProp || field.disabled;
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [shown, setShown] = useState<AutocompleteShown | null>(null);
    const registered = useMemo(
        () => new Map<HTMLElement, AutocompleteItemInfo>(),
        [],
    );
    const [list, setList] = useState<HTMLElement | null>(null);
    const [button, setButton] = useState<HTMLElement | null>(null);
    const [inputGroup, setInputGroup] = useState<HTMLElement | null>(null);
    const [clearButton, setClearButton] = useState<HTMLElement | null>(null);
    const [itemCount, setItemCount] = useState(0);
    const pending = useRef<AutocompletePending>(null);
    const [pendingTick, setPendingTick] = useState(0);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const listId = `${useId()}-list`;

    const requestHighlight = useCallback((next: AutocompletePending) => {
        pending.current = next;
        setPendingTick((tick) => tick + 1);
    }, []);
    const latest = useRef({ value, shown, inline, label });
    latest.current = { value, shown, inline, label };

    const { setOpen: setOpenState } = root;
    const setOpen = useCallback(
        (next: boolean, reason: ChangeReason, event?: Event): boolean => {
            const current = latest.current;
            const changed = setOpenState(next, reason, event);
            if (next || !changed) {
                return changed;
            }
            // leaving the input accepts the inline completion (APG, spec/autocomplete.md)
            if (
                current.inline &&
                current.shown !== null &&
                (reason === "focus-out" || reason === "outside-press")
            ) {
                setValue(current.label(current.shown.item), {
                    reason: "input-blur",
                    event,
                });
            }
            setShown(null);
            setHighlighted(null);
            pending.current = null;
            return changed;
        },
        [setOpenState, setValue],
    );

    const type = useCallback(
        (text: string, addition: boolean, event: Event) => {
            setValue(text, { reason: "input-change", event });
            setShown(null);
            setHighlighted(null);
            pending.current = null;
            const filled = text.trim() !== "";
            if (filled && !root.open) {
                setOpen(true, "input-change", event);
            } else if (!filled && root.open && !openOnInputClick) {
                setOpen(false, "input-clear", event);
                return;
            }
            if (!filled) {
                return;
            }
            if (inline) {
                if (addition) {
                    requestHighlight("complete");
                }
            } else if (autoHighlight) {
                requestHighlight("first");
            }
        },
        [
            setValue,
            setOpen,
            root.open,
            openOnInputClick,
            inline,
            autoHighlight,
            requestHighlight,
        ],
    );

    const highlight = useCallback(
        (id: string | null, from: "keyboard" | "pointer") => {
            setHighlighted(id);
            if (from === "pointer" || !latest.current.inline) {
                return;
            }
            const item = [...registered.values()].find(
                (entry) => entry.id === id,
            );
            setShown(
                item === undefined
                    ? null
                    : {
                          item: item.value,
                          text: latest.current.label(item.value),
                          selectFrom: null,
                      },
            );
        },
        [registered],
    );

    const complete = useCallback((item: AutocompleteItemInfo) => {
        // the suggestion's whole text, the part after the typed characters selected (APG)
        const typed = latest.current.value;
        setHighlighted(item.id);
        setShown({
            item: item.value,
            text: latest.current.label(item.value),
            selectFrom: typed.length,
        });
    }, []);

    const choose = useCallback(
        (item: unknown, event?: Event) => {
            setShown(null);
            setHighlighted(null);
            setValue(latest.current.label(item), {
                reason: "item-press",
                event,
            });
            setOpen(false, "item-press", event);
        },
        [setValue, setOpen],
    );
    const clear = useCallback(
        (reason: ChangeReason, event?: Event) => {
            setShown(null);
            setHighlighted(null);
            setValue("", { reason, event });
        },
        [setValue],
    );

    const filter = useMemo(
        () =>
            filterProp === undefined
                ? containsFilter<unknown>(locale)
                : (filterProp as ItemFilter<unknown> | null),
        [filterProp, locale],
    );
    const entries = useMemo(() => {
        if (items === undefined) {
            return NONE;
        }
        return filterItems(
            items as readonly unknown[],
            filters ? value.trim() : "",
            { filter: filters ? filter : null, limit, itemToString: label },
        );
    }, [items, value, filters, filter, limit, label]);

    const reset = useRef({ defaultValue, setValue, markReset: field.reset });
    reset.current = { defaultValue, setValue, markReset: field.reset };
    const input = root.trigger as HTMLInputElement | null;
    useEffect(() => {
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const current = reset.current;
                current.markReset();
                setShown(null);
                setHighlighted(null);
                current.setValue(current.defaultValue, { reason: "none" });
                setOpen(false, "none");
            },
        });
    }, [input, setOpen]);

    const context = useMemo(
        () => ({
            ...root,
            setOpen,
            field,
            mode,
            value,
            shown,
            type,
            disabled,
            name: field.name ?? name,
            required,
            openOnInputClick,
            highlighted,
            highlight,
            complete,
            choose,
            clear,
            label,
            hasItems: items !== undefined,
            entries,
            items: registered,
            list,
            setList,
            button,
            setButton,
            inputGroup,
            setInputGroup,
            clearButton,
            setClearButton,
            listId,
            pending,
            pendingTick,
            requestHighlight,
            placed,
            setPlaced,
            itemCount,
            setItemCount,
        }),
        [
            root,
            setOpen,
            field,
            mode,
            value,
            shown,
            type,
            disabled,
            name,
            required,
            openOnInputClick,
            highlighted,
            highlight,
            complete,
            choose,
            clear,
            label,
            items,
            entries,
            registered,
            list,
            button,
            inputGroup,
            clearButton,
            listId,
            pendingTick,
            requestHighlight,
            placed,
            itemCount,
        ],
    );
    return (
        <AutocompleteContext.Provider value={context}>
            {children}
        </AutocompleteContext.Provider>
    );
}
