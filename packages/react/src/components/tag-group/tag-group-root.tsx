import {
    removalFocusIndex,
    rovingTabStop,
    tagGroupKeyTarget,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    applySelection,
    createListModel,
    listPressSelection,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    type KeyboardEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagGroupContext, type TagGroupTagEntry } from "./tag-group-context.ts";

/** How many tags a TagGroup selects (spec/tag-group.md, "API"). */
export type TagGroupSelectionMode = "none" | "single" | "multiple";

export interface TagGroupRootState {
    disabled: boolean;
    empty: boolean;
}

export interface TagGroupRootProps extends PartProps<TagGroupRootState> {
    /** How many tags can be selected (default `"none"`). */
    selectionMode?: TagGroupSelectionMode;
    /** The selected tags' values, in the tags' order (an array in every mode). */
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
    /** The values of the disabled tags. */
    disabledKeys?: readonly string[];
    /** Every tag is disabled. */
    disabled?: boolean;
    /** A tag asks to be removed: remove it in the handler, or keep it. */
    onRemove?: (value: string, details: ChangeDetails) => void;
    /** The arrows wrap from the last tag to the first and back (default `true`). */
    loopFocus?: boolean;
}

const NONE: readonly string[] = [];

/** The tags in document order. */
function inOrder(entries: readonly TagGroupTagEntry[]): TagGroupTagEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/**
 * A focusable group of tags (spec/tag-group.md, React Aria's grid of tags): the selection, the
 * roving focus, the removal and its focus rule, the Field binding.
 */
export function TagGroupRoot(props: TagGroupRootProps) {
    const {
        selectionMode = "none",
        value: valueProp,
        defaultValue = NONE,
        onValueChange,
        disabledKeys = NONE,
        disabled: disabledProp = false,
        onRemove,
        loopFocus = true,
        children,
        ...rest
    } = props;
    const [value, setValue] = useControllableState<
        readonly string[],
        ChangeDetails
    >(
        valueProp,
        defaultValue,
        onValueChange as
            | ((value: readonly string[], details: ChangeDetails) => void)
            | undefined,
    );
    const direction = useContext(DirectionContext);
    const [element, ref] = useElement<HTMLElement>();
    const [list, setList] = useState<HTMLElement | null>(null);
    const [entries, setEntries] = useState<readonly TagGroupTagEntry[]>([]);
    const [active, setActive] = useState<HTMLElement | null>(null);
    const [labelId, setLabelId] = useState<string>();
    // a server render knows no tag: it never says "empty" (spec/tag-group.md, "Empty state")
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const anchor = useRef<string | null>(null);

    const ordered = inOrder(entries);
    const latest = useRef({ entries, value, onRemove, list });
    latest.current = { entries, value, onRemove, list };
    const tabStopElement = useCallback(() => {
        const current = inOrder(latest.current.entries);
        return (
            current.find((entry) => !entry.disabled && entry.element === active)
                ?.element ??
            current.find((entry) => !entry.disabled)?.element ??
            null
        );
    }, [active]);

    // inside a Field, the List is the field's control (spec/tag-group.md, "Forms")
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value: [...value],
        filled: value.length > 0,
        input: () => null,
        element: () => element,
        focusTarget: tabStopElement,
    });
    const disabled = disabledProp || field.disabled;
    const isDisabled = useCallback(
        (entry: TagGroupTagEntry) =>
            disabled || entry.disabled || disabledKeys.includes(entry.value),
        [disabled, disabledKeys],
    );
    const mode = selectionMode;

    const select = useCallback(
        (
            change: SelectionChange | null,
            reason: ChangeReason,
            event: Event,
        ) => {
            if (change === null || mode === "none") {
                return;
            }
            const current = latest.current;
            const items = inOrder(current.entries);
            const model = createListModel(
                items.map((entry) => ({
                    key: entry.value,
                    textValue: "",
                    disabled: isDisabled(entry),
                })),
            );
            const next = applySelection(
                model,
                { selected: current.value, anchor: anchor.current },
                change,
                { mode, behavior: "toggle" },
            );
            anchor.current = next.anchor;
            if (!sameSelection(next.selected, current.value)) {
                setValue([...next.selected], { reason, event });
            }
        },
        [mode, isDisabled, setValue],
    );

    const remove = useCallback(
        (item: HTMLElement, reason: ChangeReason, event?: Event) => {
            const current = latest.current;
            const items = inOrder(current.entries);
            const index = items.findIndex((entry) => entry.element === item);
            const entry = items[index];
            if (
                entry === undefined ||
                isDisabled(entry) ||
                current.onRemove === undefined
            ) {
                return;
            }
            const handler = current.onRemove;
            flushSync(() => handler(entry.value, { reason, event }));
            // the app kept it: it keeps the focus
            if (item.isConnected) {
                item.focus();
                return;
            }
            const target = removalFocusIndex(
                items.length,
                index,
                (candidate) => {
                    const other = items[candidate];
                    return (
                        other === undefined ||
                        !other.element.isConnected ||
                        isDisabled(other)
                    );
                },
            );
            (target === -1
                ? latest.current.list
                : items[target]?.element
            )?.focus();
        },
        [isDisabled],
    );

    const onListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented) {
            return;
        }
        const items = inOrder(latest.current.entries);
        const index = items.findIndex(
            (entry) => entry.element === event.target,
        );
        const entry = items[index];
        if (entry === undefined) {
            return;
        }
        const action = tagGroupKeyTarget(event, index, items.length, {
            rtl: getDirection(event.currentTarget, direction) === "rtl",
            loop: loopFocus,
            skip: (candidate) => {
                const other = items[candidate];
                return other === undefined || isDisabled(other);
            },
            selectable: mode !== "none",
            removable: latest.current.onRemove !== undefined,
        });
        if (action === null) {
            return;
        }
        event.preventDefault();
        if (action.type === "focus") {
            items[action.index]?.element.focus();
        } else if (action.type === "select") {
            select(
                listPressSelection(entry.value, NO_MODIFIERS, {
                    mode,
                    behavior: "toggle",
                }),
                "keyboard",
                event.nativeEvent,
            );
        } else {
            remove(entry.element, "keyboard", event.nativeEvent);
        }
    };

    // stable for the context: it reads the latest render's state
    const keyDown = useRef(onListKeyDown);
    keyDown.current = onListKeyDown;
    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => keyDown.current(event),
        [],
    );

    const register = useCallback((entry: TagGroupTagEntry) => {
        setEntries((current) => [...current, entry]);
        return () =>
            setEntries((current) => current.filter((item) => item !== entry));
    }, []);
    const focused = useCallback((item: HTMLElement) => setActive(item), []);
    const press = useCallback(
        (item: HTMLElement, event: MouseEvent) => {
            const entry = latest.current.entries.find(
                (candidate) => candidate.element === item,
            );
            if (entry === undefined || isDisabled(entry)) {
                return;
            }
            select(
                listPressSelection(entry.value, NO_MODIFIERS, {
                    mode,
                    behavior: "toggle",
                }),
                "item-press",
                event,
            );
        },
        [isDisabled, mode, select],
    );
    const { onFocus: fieldFocus, onBlur: fieldBlur } = field;
    const onListBlur = useCallback(
        (next: EventTarget | null, container: HTMLElement) => {
            if (!(next instanceof Node) || !container.contains(next)) {
                fieldBlur();
            }
        },
        [fieldBlur],
    );

    const empty = mounted && entries.length === 0;
    const tabStopIndex = rovingTabStop(
        ordered.length,
        ordered.findIndex((entry) => entry.element === active),
        (candidate) => {
            const other = ordered[candidate];
            return other === undefined || isDisabled(other);
        },
    );
    const tabStop = ordered[tabStopIndex]?.element ?? null;
    const labelledBy = field.aria["aria-labelledby"] ?? labelId;
    const context = useMemo(
        () => ({
            selectable: mode !== "none",
            multiple: mode === "multiple",
            disabled,
            disabledKeys,
            selected: value,
            empty,
            tabStop,
            labelledBy,
            setLabelId,
            setList,
            fieldAria: field.aria,
            fieldAttributes: field.attributes,
            onListKeyDown: onKeyDown,
            onListFocus: fieldFocus,
            onListBlur,
            register,
            focused,
            press,
            remove,
        }),
        [
            mode,
            disabled,
            disabledKeys,
            value,
            empty,
            tabStop,
            labelledBy,
            field.aria,
            field.attributes,
            fieldFocus,
            onKeyDown,
            onListBlur,
            register,
            focused,
            press,
            remove,
        ],
    );
    const state = { disabled, empty };
    return (
        <TagGroupContext.Provider value={context}>
            {renderElement(
                "div",
                { ...rest, children },
                state,
                {
                    "data-primitives-part": "tag-group-root",
                    ...stateAttributes(state),
                },
                ref,
            )}
        </TagGroupContext.Provider>
    );
}

const NO_MODIFIERS = { shiftKey: false, ctrlKey: false, metaKey: false };
