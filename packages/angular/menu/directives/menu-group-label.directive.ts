import { Directive, inject, input, signal } from "@angular/core";
import { labelId } from "@fragiola/primitives-angular/internal";
import { MenuGroup } from "./menu-group.directive.ts";
import { MenuRootBase } from "./menu-root-base.ts";

/** Names its Group: `<div menuGroupLabel>`. */
@Directive({
    selector: "[menuGroupLabel]",
    exportAs: "menuGroupLabel",
    host: {
        "[attr.data-primitives-part]": "part",
        "[attr.id]": "resolvedId()",
    },
})
export class MenuGroupLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly part =
        inject(MenuRootBase, { optional: true })?.part("group-label") ??
        "menu-group-label";
    protected readonly resolvedId = labelId(
        this.id,
        inject(MenuGroup, { optional: true })?.labelId ?? signal(undefined),
        "primitives-menu-group-label",
    );
}
