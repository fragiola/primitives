import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { CollapsibleRoot } from "./collapsible-root.directive.ts";

/**
 * The disclosure button (spec/collapsible.md): `<button collapsibleTrigger>`. Enter and Space
 * toggle it through its native click.
 */
@Directive({
    selector: "[collapsibleTrigger]",
    exportAs: "collapsibleTrigger",
    host: {
        type: "button",
        "data-primitives-part": "collapsible-trigger",
        "[attr.aria-expanded]": "root.state().open ? 'true' : 'false'",
        "[attr.aria-controls]": "root.state().open ? root.panelId : null",
        "[attr.disabled]": "data().disabled",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-panel-open]": "data()['panel-open']",
        "(click)": "onClick()",
    },
})
export class CollapsibleTrigger {
    protected readonly root = inject(CollapsibleRoot);
    readonly state = this.root.state;
    protected readonly data = computed(() => {
        const { open, disabled } = this.root.state();
        return dataValues({ disabled, "panel-open": open });
    });

    protected onClick(): void {
        const { open, disabled } = this.root.state();
        if (!disabled) {
            this.root.setOpen(!open, "trigger-press");
        }
    }
}
