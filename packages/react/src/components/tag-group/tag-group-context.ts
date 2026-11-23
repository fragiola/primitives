import type { KeyboardEvent } from "react";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

/** A rendered Tag, as the Root knows it. */
export interface TagGroupTagEntry {
    element: HTMLElement;
    value: string;
    disabled: boolean;
}

export interface TagGroupContextValue {
    selectable: boolean;
    multiple: boolean;
    disabled: boolean;
    disabledKeys: readonly string[];
    selected: readonly string[];
    /** No Tag is rendered, once mounted (spec/tag-group.md, "Empty state"). */
    empty: boolean;
    /** The Tag holding the tab stop (`tabindex="0"`); `null` before the tags are known. */
    tabStop: HTMLElement | null;
    /** The List's `aria-labelledby`: the field's label, else the Label's id. */
    labelledBy: string | undefined;
    setLabelId: (id: string | undefined) => void;
    setList: (element: HTMLElement | null) => void;
    /** The field's ARIA and state attributes, for the List (the field's control). */
    fieldAria: Record<string, string | undefined>;
    fieldAttributes: Record<`data-${string}`, string>;
    onListKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onListFocus: () => void;
    onListBlur: (next: EventTarget | null, list: HTMLElement) => void;
    register: (entry: TagGroupTagEntry) => () => void;
    /** A Tag took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on a Tag (spec/tag-group.md, "Pointer"). */
    press: (element: HTMLElement, event: MouseEvent) => void;
    /** A Tag asks to be removed (spec/tag-group.md, "Focus"). */
    remove: (element: HTMLElement, reason: ChangeReason, event?: Event) => void;
}

export const TagGroupContext = createContext<TagGroupContextValue | null>(null);

export interface TagGroupTagContextValue {
    disabled: boolean;
    element: () => HTMLElement | null;
}

export const TagGroupTagContext = createContext<TagGroupTagContextValue | null>(
    null,
);
