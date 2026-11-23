import type { ComputedRef, InjectionKey } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

/** A rendered Tag, as it registered; each getter is read when it is needed. */
export interface TagGroupTagEntry {
    element: HTMLElement;
    value: () => string;
    disabled: () => boolean;
}

export interface TagGroupContext {
    selectable: () => boolean;
    multiple: () => boolean;
    disabled: () => boolean;
    disabledKeys: () => readonly string[];
    selected: ComputedRef<readonly string[]>;
    /** No Tag is rendered, once mounted (spec/tag-group.md, "Empty state"). */
    empty: ComputedRef<boolean>;
    /** The Tag holding the tab stop (`tabindex="0"`); `null` before the tags are known. */
    tabStop: ComputedRef<HTMLElement | null>;
    /** The List's `aria-labelledby`: the field's label, else the Label's id. */
    labelledBy: () => string | undefined;
    setLabelId: (id: string | undefined) => void;
    setList: (element: unknown) => void;
    /** The field's ARIA and state attributes, for the List (the field's control). */
    fieldAria: () => Record<string, string | undefined>;
    fieldAttributes: () => Record<string, string>;
    onListKeydown: (event: KeyboardEvent) => void;
    onListFocusin: () => void;
    onListFocusout: (event: FocusEvent) => void;
    register: (entry: TagGroupTagEntry) => () => void;
    /** A Tag took focus. */
    focused: (element: HTMLElement) => void;
    /** A press on a Tag (spec/tag-group.md, "Pointer"). */
    press: (element: HTMLElement, event: MouseEvent) => void;
    /** A Tag asks to be removed (spec/tag-group.md, "Focus"). */
    remove: (element: HTMLElement, reason: ChangeReason, event?: Event) => void;
}

export const TagGroupKey: InjectionKey<TagGroupContext> = Symbol("TagGroup");

export interface TagGroupTagContext {
    disabled: () => boolean;
    element: () => HTMLElement | null;
}

export const TagGroupTagKey: InjectionKey<TagGroupTagContext> =
    Symbol("TagGroupTag");
