import type { InjectionKey } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";

/**
 * What a ToggleGroup gives its Toggles (spec/toggle-group.md). It lives in the Toggle's folder, so
 * a Toggle alone ships no ToggleGroup code; `/toggle-group` is built on `/toggle`
 * (`ENTRY_DEPENDENCIES`).
 */
export interface ToggleGroupContext {
    /** The values of the pressed toggles. */
    value: () => readonly string[];
    disabled: () => boolean;
    /** A Toggle of the group was pressed or released. */
    setPressed: (
        value: string,
        pressed: boolean,
        details: ChangeDetails,
    ) => void;
}

export const ToggleGroupKey: InjectionKey<ToggleGroupContext> =
    Symbol("ToggleGroup");
