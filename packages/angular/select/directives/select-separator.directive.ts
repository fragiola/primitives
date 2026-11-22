import { Directive } from "@angular/core";

/**
 * Between items or groups (spec/select.md); no role of its own (a `listbox` owns only groups and
 * options): `<div selectSeparator>`.
 */
@Directive({
    selector: "[selectSeparator]",
    host: {
        role: "presentation",
        "data-orientation": "horizontal",
        "data-primitives-part": "select-separator",
    },
})
export class SelectSeparator {}
