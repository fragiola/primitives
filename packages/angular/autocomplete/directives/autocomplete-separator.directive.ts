import { Directive } from "@angular/core";

/** Between groups; no role of its own (a `listbox` owns only groups and options). */
@Directive({
    selector: "[autocompleteSeparator]",
    host: {
        role: "presentation",
        "data-orientation": "horizontal",
        "data-primitives-part": "autocomplete-separator",
    },
})
export class AutocompleteSeparator {}
