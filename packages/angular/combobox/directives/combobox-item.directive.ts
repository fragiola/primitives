import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import {
    dataValues,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import {
    type ComboboxItemValue,
    ComboboxRoot,
} from "./combobox-root.directive.ts";

export interface ComboboxItemState {
    highlighted: boolean;
    selected: boolean;
    disabled: boolean;
}

/**
 * An `option`: `<div comboboxItem [value]="fruit">`. When chosen, the input's text becomes
 * `itemToStringLabel(value)`. A disabled item can be highlighted, never chosen.
 */
@Directive({
    selector: "[comboboxItem]",
    exportAs: "comboboxItem",
    host: {
        role: "option",
        "data-primitives-part": "combobox-item",
        "[attr.id]": "id",
        "[attr.aria-selected]": "state().selected ? 'true' : null",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "(pointermove)": "onPointerMove()",
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick()",
    },
})
export class ComboboxItem {
    private readonly root = inject(ComboboxRoot);
    readonly value = input.required<ComboboxItemValue>();
    readonly disabled = input(false, { transform: booleanAttribute });
    protected readonly id = injectId("primitives-combobox-item");
    readonly state = computed<ComboboxItemState>(() => ({
        highlighted: this.root.highlighted() === this.id,
        selected: this.root.isSelected(this.value()),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = injectHost();
        const root = this.root;
        let unregister: (() => void) | null = null;
        effect(() => {
            const value = this.value();
            const disabled = this.disabled();
            untracked(() => {
                unregister?.();
                unregister = root.registerItem(host, {
                    value,
                    disabled,
                    id: this.id,
                });
            });
        });
        inject(DestroyRef).onDestroy(() => unregister?.());
        // within the popup only: a list that mounts before it is placed never scrolls the page
        afterRenderEffect(() => {
            if (this.state().highlighted) {
                scrollIntoViewWithin(host, this.root.overlay.positioner());
            }
        });
    }

    protected onPointerMove(): void {
        if (!this.state().highlighted) {
            this.root.highlighted.set(this.id);
        }
    }

    protected onClick(): void {
        if (!this.disabled()) {
            this.root.choose(this.value());
        }
    }
}
