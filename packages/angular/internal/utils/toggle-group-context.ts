import { InjectionToken, type Signal } from "@angular/core";
import type { ChangeDetails } from "./change-details.ts";

/**
 * What a `[toggleGroup]` gives its Toggles (spec/toggle-group.md). The token lives in the
 * package's shared code: an entry exports only its API (the API pages), so `/toggle` cannot
 * export it to `/toggle-group`; a Toggle alone still ships no ToggleGroup code.
 */
export interface ToggleGroupContext {
    /** The values of the pressed toggles. */
    readonly value: Signal<readonly string[]>;
    readonly disabled: Signal<boolean>;
    /** A Toggle of the group was pressed or released. */
    setPressed: (
        value: string,
        pressed: boolean,
        details: ChangeDetails,
    ) => void;
}

export const TOGGLE_GROUP = new InjectionToken<ToggleGroupContext>(
    "ToggleGroup",
);
