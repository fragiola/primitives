import { Directive, inject, input, signal } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { MenuGroup } from "./menu-group.directive.ts";

/** Names its Group: `<div menuGroupLabel>`. */
@Directive({
    selector: "[menuGroupLabel]",
    exportAs: "menuGroupLabel",
    host: {
        "data-primitives-part": "menu-group-label",
        "[attr.id]": "resolvedId()",
    },
})
export class MenuGroupLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        inject(MenuGroup, { optional: true })?.labelId ?? signal(undefined),
        "primitives-menu-group-label",
    );
}
