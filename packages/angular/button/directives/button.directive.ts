import { booleanAttribute, computed, Directive, input } from "@angular/core";
import {
    type ButtonType,
    buttonAttributes,
    buttonBehaviour,
    dataValues,
    injectHost,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";

export type { ButtonType };

export interface ButtonState {
    disabled: boolean;
}

/**
 * An element that performs an action (spec/button.md, the APG button), on the consumer's own
 * element: `<button button (click)="save()">`, or another element with the keys a native button
 * has: `<span button [nativeButton]="false">`. While disabled, no press, pointer down or key but
 * Tab reaches the consumer's handlers: a capturing listener on the element stops them first. The
 * behaviour is the package's shared code (`/internal`), which Toggle and Toolbar.Button use too.
 */
@Directive({
    selector: "[button]",
    exportAs: "button",
    host: {
        "data-primitives-part": "button-root",
        "[attr.type]": "attributes().type",
        "[attr.role]": "attributes().role",
        "[attr.disabled]": "attributes().disabled",
        "[attr.aria-disabled]": "attributes()['aria-disabled']",
        "[attr.tabindex]": "attributes().tabindex",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class Button {
    /** The button ignores presses and keys. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** A disabled button stays in the tab order and focusable (Base UI). */
    readonly focusableWhenDisabled = input(false, {
        transform: booleanAttribute,
    });
    /**
     * Whether the element is a native `<button>` (default `true`). `false` on another element: the
     * Button adds `role="button"`, the tab order and the keys.
     */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    /** A native Button is `type="button"` unless given. */
    readonly type = input<ButtonType | undefined>(undefined);

    private readonly ownTabIndex = ownAttribute("tabindex");
    readonly state = computed<ButtonState>(() => ({
        disabled: this.disabled(),
    }));
    protected readonly attributes = computed(() =>
        buttonAttributes({
            disabled: this.disabled(),
            focusableWhenDisabled: this.focusableWhenDisabled(),
            nativeButton: this.nativeButton(),
            type: this.type(),
            tabIndex: this.ownTabIndex,
        }),
    );
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        buttonBehaviour(injectHost(), {
            disabled: this.disabled,
            nativeButton: this.nativeButton,
        });
    }
}
