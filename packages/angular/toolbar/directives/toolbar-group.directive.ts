import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    dataValues,
    ROVING_SCOPE,
    type RovingScope,
} from "@fragiola/primitives-angular/internal";
import {
    type ToolbarItemState,
    ToolbarRoot,
} from "./toolbar-root.directive.ts";

/**
 * A group of a toolbar's items (spec/toolbar.md): `<div toolbarGroup aria-label="History">`. No
 * focus of its own; it passes its `disabled` on to the items inside it through the toolbar's
 * roving scope ("Nested composites").
 */
@Directive({
    selector: "[toolbarGroup]",
    exportAs: "toolbarGroup",
    providers: [
        { provide: ROVING_SCOPE, useFactory: () => inject(ToolbarGroup).scope },
    ],
    host: {
        role: "group",
        "data-primitives-part": "toolbar-group",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class ToolbarGroup {
    /** Every item in it is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly root = inject(ToolbarRoot);
    private readonly parent = inject(ROVING_SCOPE, { skipSelf: true });
    private readonly isDisabled = computed(
        () => this.disabled() || this.parent.disabled(),
    );
    /** The toolbar's scope, with its `disabled` merged in (`ROVING_SCOPE`). */
    readonly scope: RovingScope = { ...this.parent, disabled: this.isDisabled };
    readonly state = computed<ToolbarItemState>(() => ({
        orientation: this.root.orientation(),
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
}
