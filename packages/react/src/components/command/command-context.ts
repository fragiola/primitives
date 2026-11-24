import type { CommandFilter } from "@fragiola/primitives/command";
import { createContext } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** A rendered Item, as the Root knows it: kept up to date by the Item on every render. */
export interface CommandItemInfo {
    value: string;
    keywords: readonly string[];
    disabled: boolean;
    forceMount: boolean;
    id: string;
    onSelect: ((value: string, event: Event) => void) | undefined;
}

export interface CommandContextValue {
    /** The text. */
    search: string;
    setSearch: (value: string, details: ChangeDetails) => void;
    filter: CommandFilter | null;
    pages: readonly string[];
    setPages: (pages: string[], details: ChangeDetails) => void;
    loading: boolean;
    loopFocus: boolean;
    /** The highlighted Item's value. */
    highlighted: string | null;
    highlight: (value: string | null) => void;
    /** The rendered Items, by element. */
    items: Map<HTMLElement, CommandItemInfo>;
    /** An Item mounted or unmounted: the Root sets the highlight again. */
    registered: () => void;
    /** The shown Items, `null` before the Root mounted. */
    shownCount: number | null;
    root: HTMLElement | null;
    list: HTMLElement | null;
    setList: (element: HTMLElement | null) => void;
    listId: string;
}

export const CommandContext = createContext<CommandContextValue | null>(null);

export interface CommandGroupContextValue {
    labelId: string;
}

export const CommandGroupContext =
    createContext<CommandGroupContextValue | null>(null);

/** The shown Items, in the list's order. */
export function shownItems(context: {
    list: HTMLElement | null;
    items: Map<HTMLElement, CommandItemInfo>;
}): { element: HTMLElement; info: CommandItemInfo }[] {
    if (context.list === null) {
        return [];
    }
    return [
        ...context.list.querySelectorAll<HTMLElement>(
            '[role="option"]:not([hidden])',
        ),
    ].flatMap((element) => {
        const info = context.items.get(element);
        return info === undefined ? [] : [{ element, info }];
    });
}
