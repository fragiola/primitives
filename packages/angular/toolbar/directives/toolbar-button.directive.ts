import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    type ButtonType,
    buttonAttributes,
    buttonBehaviour,
    dataValues,
    injectHost,
    injectRovingItem,
    ownAttribute,
    ROVING_SCOPE,
} from "@fragiola/primitives-angular/internal";
import {
    type ToolbarItemState,
    ToolbarRoot,
} from "./toolbar-root.directive.ts";

/**
 * A button of a toolbar (spec/toolbar.md): `<button toolbarButton (click)="undo()">`, Button's
 * behaviour and an item of the toolbar's focus. A disabled one is skipped by the arrows, unless
 * `focusableWhenDisabled` ("Disabled items").
 */
@Directive({
    selector: "[toolbarButton]",
    exportAs: "toolbarButton",
    host: {
        "data-primitives-part": "toolbar-button",
        "[attr.type]": "attributes().type",
        "[attr.role]": "attributes().role",
        "[attr.disabled]": "attributes().disabled",
        "[attr.aria-disabled]": "attributes()['aria-disabled']",
        "[attr.tabindex]": "attributes().tabindex",
        "[attr.data-orientation]": "data().orientation",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class ToolbarButton {
    /** The button ignores presses and keys. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** A disabled button the arrows still reach (spec/toolbar.md, "Disabled items"). */
    readonly focusableWhenDisabled = input(false, {
        transform: booleanAttribute,
    });
    /** Whether the element is a native `<button>` (default `true`), as Button's. */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    /** A native button is `type="button"` unless given. */
    readonly type = input<ButtonType | undefined>(undefined);

    private readonly root = inject(ToolbarRoot);
    private readonly scope = inject(ROVING_SCOPE);
    private readonly isDisabled = computed(
        () => this.disabled() || this.scope.disabled(),
    );
    private readonly item = injectRovingItem(
        () => !this.isDisabled() || this.focusableWhenDisabled(),
    );
    private readonly ownTabIndex = ownAttribute("tabindex");
    readonly state = computed<ToolbarItemState>(() => ({
        orientation: this.root.orientation(),
        disabled: this.isDisabled(),
    }));
    protected readonly attributes = computed(() =>
        buttonAttributes({
            disabled: this.isDisabled(),
            focusableWhenDisabled: this.focusableWhenDisabled(),
            nativeButton: this.nativeButton(),
            type: this.type(),
            tabIndex: this.item?.tabIndex() ?? this.ownTabIndex,
        }),
    );
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        buttonBehaviour(injectHost(), {
            disabled: this.isDisabled,
            nativeButton: this.nativeButton,
            composite: () => this.scope.keydown,
        });
    }
}
