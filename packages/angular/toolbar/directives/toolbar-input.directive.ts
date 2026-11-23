import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    dataValues,
    injectRovingItem,
    ownAttribute,
    ROVING_SCOPE,
} from "@fragiola/primitives-angular/internal";
import {
    type ToolbarItemState,
    ToolbarRoot,
} from "./toolbar-root.directive.ts";

/**
 * A text input of a toolbar (spec/toolbar.md): `<input toolbarInput aria-label="Search">`, an item
 * of the toolbar's focus that keeps its caret keys until the caret reaches the text's edge. A
 * disabled one is skipped by the arrows, unless `focusableWhenDisabled`: then it is
 * `aria-disabled` and `readonly` ("Disabled items").
 */
@Directive({
    selector: "[toolbarInput]",
    exportAs: "toolbarInput",
    host: {
        "data-primitives-part": "toolbar-input",
        "[attr.disabled]":
            "state().disabled && !focusableWhenDisabled() ? '' : null",
        "[attr.aria-disabled]": "readOnly() ? 'true' : null",
        "[attr.readonly]": "readOnly() ? '' : null",
        "[attr.tabindex]": "item?.tabIndex() ?? ownTabIndex",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "preventWhenDisabled($event)",
        "(pointerdown)": "preventWhenDisabled($event)",
    },
})
export class ToolbarInput {
    /** The input ignores presses and typing. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** A disabled input the arrows still reach: `aria-disabled` and `readonly` (spec/toolbar.md). */
    readonly focusableWhenDisabled = input(false, {
        transform: booleanAttribute,
    });

    private readonly root = inject(ToolbarRoot);
    private readonly scope = inject(ROVING_SCOPE);
    private readonly isDisabled = computed(
        () => this.disabled() || this.scope.disabled(),
    );
    protected readonly item = injectRovingItem(
        () => !this.isDisabled() || this.focusableWhenDisabled(),
    );
    protected readonly ownTabIndex = ownAttribute("tabindex");
    readonly state = computed<ToolbarItemState>(() => ({
        orientation: this.root.orientation(),
        disabled: this.isDisabled(),
    }));
    protected readonly readOnly = computed(
        () => this.isDisabled() && this.focusableWhenDisabled(),
    );
    protected readonly data = computed(() => dataValues(this.state()));

    protected preventWhenDisabled(event: Event): void {
        if (this.isDisabled()) {
            event.preventDefault();
        }
    }
}
