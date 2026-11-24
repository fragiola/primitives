import type { CommandFilter } from "@fragiola/primitives/command";
import type { ComputedRef, InjectionKey, Ref, ShallowRef } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** A rendered Item, as the Root knows it: its getters read the Item's latest props. */
export interface CommandItemInfo {
    readonly value: string;
    readonly keywords: readonly string[];
    readonly disabled: boolean;
    readonly forceMount: boolean;
    readonly id: string;
    /** Runs the action (the Item's `select` event). */
    select: (event: Event) => void;
}

export interface CommandContext {
    /** The text. */
    search: ComputedRef<string>;
    setSearch: (value: string, details: ChangeDetails) => void;
    filter: () => CommandFilter | null;
    pages: ComputedRef<readonly string[]>;
    setPages: (pages: string[], details: ChangeDetails) => void;
    loading: () => boolean;
    loopFocus: () => boolean;
    /** The highlighted Item's value. */
    highlighted: Ref<string | null>;
    /** The rendered Items, by element. */
    items: Map<HTMLElement, CommandItemInfo>;
    /** Bumped when an Item mounts or unmounts: the Root sets the highlight again. */
    version: Ref<number>;
    /** The shown Items, `null` before the Root mounted. */
    shownCount: Ref<number | null>;
    root: ShallowRef<HTMLElement | null>;
    list: ShallowRef<HTMLElement | null>;
    listId: string;
}

export const CommandKey: InjectionKey<CommandContext> = Symbol("Command");

export const CommandGroupKey: InjectionKey<{ labelId: string }> =
    Symbol("CommandGroup");

/** The shown Items, in the list's order. */
export function shownItems(
    context: CommandContext,
): { element: HTMLElement; info: CommandItemInfo }[] {
    const list = context.list.value;
    if (list === null) {
        return [];
    }
    return [
        ...list.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])'),
    ].flatMap((element) => {
        const info = context.items.get(element);
        return info === undefined ? [] : [{ element, info }];
    });
}
