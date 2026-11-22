import { Directive, inject, signal } from "@angular/core";
import { MenuRootBase } from "./menu-root-base.ts";

/** Groups items under its GroupLabel: `<div menuGroup>`. */
@Directive({
    selector: "[menuGroup]",
    exportAs: "menuGroup",
    host: {
        role: "group",
        "[attr.data-primitives-part]": "part",
        "[attr.aria-labelledby]": "labelId() ?? null",
    },
})
export class MenuGroup {
    readonly labelId = signal<string | undefined>(undefined);
    protected readonly part =
        inject(MenuRootBase, { optional: true })?.part("group") ?? "menu-group";
}
