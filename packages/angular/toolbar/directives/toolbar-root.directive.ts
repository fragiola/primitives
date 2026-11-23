import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import type { RovingOrientation } from "@fragiola/primitives/collection";
import {
    dataValues,
    injectRovingComposite,
    ROVING_SCOPE,
} from "@fragiola/primitives-angular/internal";

export interface ToolbarRootState {
    orientation: RovingOrientation;
    disabled: boolean;
}

/** The state of a toolbar's Button, Input and Group: the toolbar's orientation, and whether the part is disabled. */
export interface ToolbarItemState {
    orientation: RovingOrientation;
    disabled: boolean;
}

/**
 * A set of controls that is one tab stop (spec/toolbar.md, the APG toolbar):
 * `<div toolbarRoot aria-label="Formatting">`. It is the roving-focus scope every item inside
 * registers with, a ToggleGroup's Toggles included ("Nested composites").
 */
@Directive({
    selector: "[toolbarRoot]",
    exportAs: "toolbarRoot",
    providers: [
        { provide: ROVING_SCOPE, useFactory: () => inject(ToolbarRoot).scope },
    ],
    host: {
        role: "toolbar",
        "data-primitives-part": "toolbar-root",
        "[attr.aria-orientation]": "state().orientation",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "(keydown)": "scope.keydown($event)",
    },
})
export class ToolbarRoot {
    /** The arrow keys' axis (default `"horizontal"`). */
    readonly orientation = input<RovingOrientation>("horizontal");
    /** The arrows wrap from the last item to the first and back (default `true`). */
    readonly loopFocus = input(true, { transform: booleanAttribute });
    /** Every Button, Input, Toggle and ToggleGroup in it is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** The toolbar's roving-focus scope (`ROVING_SCOPE`). */
    readonly scope = injectRovingComposite({
        orientation: this.orientation,
        loopFocus: this.loopFocus,
        disabled: this.disabled,
    });
    readonly state = computed<ToolbarRootState>(() => ({
        orientation: this.orientation(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
}
