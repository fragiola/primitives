import type { CascadeItem } from "@fragiola/primitives/cascade";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext, type MutableRefObject } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";

/** Where the pointer left a parent whose level is open (spec/cascade-select.md, "Pointer"). */
export interface CascadeSafeArea {
    x: number;
    y: number;
    /** The depth of the open level the pointer travels to. */
    depth: number;
}

export interface CascadeSelectContextValue extends OverlayRoot {
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    items: readonly CascadeItem[];
    /** The chosen path. */
    value: readonly string[];
    disabled: boolean;
    required: boolean;
    changeOnSelect: boolean;
    /** The active path: the highlighted item of each open level, the last one highlighted. */
    active: readonly string[];
    /** The highlighted parent's level is open too (the pointer opened it). */
    peek: boolean;
    /** The items of every open level, from the first. */
    levels: readonly (readonly CascadeItem[])[];
    setActive: (active: readonly string[], peek?: boolean) => void;
    /** Opens the popup on this active path. */
    openOn: (
        active: readonly string[],
        reason: ChangeReason,
        event?: Event,
    ) => void;
    /** Chooses a path; closes the popup unless `keepOpen`. */
    choose: (
        path: readonly string[],
        reason: ChangeReason,
        event?: Event,
        keepOpen?: boolean,
    ) => void;
    levelId: (depth: number) => string;
    /** The id of the option of `value` in the open level `depth`. */
    itemId: (depth: number, value: string) => string;
    safeArea: MutableRefObject<CascadeSafeArea | null>;
    hoverTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
}

export const CascadeSelectContext =
    createContext<CascadeSelectContextValue | null>(null);

/** What a Level gives its Items: its depth and its items. */
export interface CascadeSelectLevelContextValue {
    depth: number;
    items: readonly CascadeItem[];
}

export const CascadeSelectLevelContext =
    createContext<CascadeSelectLevelContextValue | null>(null);

export interface CascadeSelectItemContextValue {
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

export const CascadeSelectItemContext =
    createContext<CascadeSelectItemContextValue | null>(null);

/** Whether two paths hold the same values. */
export function samePath(a: readonly string[], b: readonly string[]): boolean {
    return (
        a.length === b.length && a.every((entry, index) => entry === b[index])
    );
}

/** The first enabled item of a level, else its first. */
export function firstItem(items: readonly CascadeItem[]): string | undefined {
    return (items.find((item) => !item.disabled) ?? items[0])?.value;
}

/** The active path the popup opens on: the chosen path, else the first level's first enabled item. */
export function initialActive(
    items: readonly CascadeItem[],
    value: readonly string[],
    found: readonly CascadeItem[] | null,
): readonly string[] {
    if (found !== null && found.length > 0) {
        return value;
    }
    const first = firstItem(items);
    return first === undefined ? [] : [first];
}
