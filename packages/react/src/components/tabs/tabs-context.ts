import type { ActivationDirection } from "@fragiola/primitives/collection";
import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface TabInfo {
    value: string;
    disabled: boolean;
}

export interface TabsContextValue {
    value: string | undefined;
    select: (value: string, reason: ChangeReason) => void;
    orientation: "horizontal" | "vertical";
    activation: "automatic" | "manual";
    loopFocus: boolean;
    /** Where the selected tab sits from the one selected before it (spec/tabs.md). */
    activationDirection: ActivationDirection;
    baseId: string;
    tabs: Map<HTMLElement, TabInfo>;
    list: HTMLElement | null;
    setList: (element: HTMLElement | null) => void;
    /** Bumped when a tab registers, so the roving tabindex and the indicator follow. */
    version: number;
    bump: () => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

// A value may hold any character (`"my account"`): it is encoded, so the id holds no whitespace
// and `aria-controls` / `aria-labelledby` (lists of ids) still name one element.
export const tabId = (baseId: string, value: string) =>
    `${baseId}-tab-${encodeURIComponent(value)}`;
export const panelId = (baseId: string, value: string) =>
    `${baseId}-panel-${encodeURIComponent(value)}`;
