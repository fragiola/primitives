import type { Signal } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import {
    type AutocompleteItemValue,
    AutocompleteRoot,
    type AutocompleteState,
} from "../directives/autocomplete-root.directive.ts";

/** The part hook of the enclosing `[autocompleteRoot]`: its state, and `choose` / `clear`. */
export function injectAutocomplete(): {
    state: Signal<AutocompleteState>;
    choose: (item: AutocompleteItemValue) => void;
    clear: () => void;
} {
    const root = injectEnclosing(
        AutocompleteRoot,
        "autocompleteRoot",
        "injectAutocomplete",
    );
    return {
        state: root.state,
        choose: (item) => root.choose(item),
        clear: () => root.clear("none"),
    };
}
