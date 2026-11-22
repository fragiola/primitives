import { Directive } from "@angular/core";

/** Separates items: `<div menuSeparator>`. */
@Directive({
    selector: "[menuSeparator]",
    host: {
        role: "separator",
        "aria-orientation": "horizontal",
        "data-primitives-part": "menu-separator",
    },
})
export class MenuSeparator {}
