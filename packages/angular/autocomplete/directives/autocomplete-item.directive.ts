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
    type AutocompleteItemValue,
    AutocompleteRoot,
} from "./autocomplete-root.directive.ts";

export interface AutocompleteItemState {
    highlighted: boolean;
    disabled: boolean;
}

/**
 * An `option`, a suggestion never selected: `<div autocompleteItem [value]="fruit">`. When chosen,
 * its `itemToStringValue` becomes the value. A disabled one can be highlighted, never chosen.
 */
@Directive({
    selector: "[autocompleteItem]",
    exportAs: "autocompleteItem",
    host: {
        role: "option",
        "data-primitives-part": "autocomplete-item",
        "[attr.id]": "id",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "(pointermove)": "onPointerMove()",
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class AutocompleteItem {
    private readonly root = inject(AutocompleteRoot);
    readonly value = input.required<AutocompleteItemValue>();
    readonly disabled = input(false, { transform: booleanAttribute });
    protected readonly id = injectId("primitives-autocomplete-item");
    readonly state = computed<AutocompleteItemState>(() => ({
        highlighted: this.root.highlighted() === this.id,
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
            this.root.highlight(this.id, "pointer");
        }
    }

    protected onClick(event: MouseEvent): void {
        if (!this.disabled()) {
            this.root.choose(this.value(), event);
        }
    }
}
