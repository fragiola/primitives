import {
    afterEveryRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    untracked,
} from "@angular/core";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { SelectRoot } from "./select-root.directive.ts";

export interface SelectItemState {
    highlighted: boolean;
    selected: boolean;
    disabled: boolean;
}

/**
 * An `option` (spec/select.md): `<div selectItem value="apple">`. A disabled item can be
 * highlighted, never chosen.
 */
@Directive({
    selector: "[selectItem]",
    exportAs: "selectItem",
    host: {
        role: "option",
        "data-primitives-part": "select-item",
        "[attr.id]": "root.itemId(value())",
        "[attr.aria-selected]": "state().selected ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "(pointermove)": "onPointerMove()",
        // the trigger keeps DOM focus
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class SelectItem {
    protected readonly root = inject(SelectRoot);
    readonly value = input.required<string>();
    /**
     * The label the Value shows and typeahead matches, without the Root's `items` (default: its
     * ItemText's text, else its text content).
     */
    readonly label = input<string | undefined>(undefined);
    /** Can be highlighted, never chosen (default: the Root item's `disabled`). */
    readonly disabled = input(undefined, {
        transform: (value: unknown) =>
            value === undefined ? undefined : booleanAttribute(value),
    });
    readonly state = computed<SelectItemState>(() => {
        const value = this.value();
        return {
            highlighted: this.root.highlighted() === value,
            selected: this.root.selected() === value,
            disabled:
                this.disabled() ??
                this.root.itemList().find((item) => item.value === value)
                    ?.disabled ??
                false,
        };
    });
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = injectHost();
        // without `items`: registers its value, label and disabled state, read once rendered (its
        // text may change with any render)
        let registration: {
            value: string;
            label: string;
            disabled: boolean;
            unregister: () => void;
        } | null = null;
        afterEveryRender(() => {
            if (untracked(this.root.items) !== undefined) {
                return;
            }
            const text = host.querySelector(
                '[data-primitives-part="select-item-text"]',
            );
            const value = untracked(this.value);
            const label = (
                untracked(this.label) ??
                (text ?? host).textContent ??
                ""
            ).trim();
            const disabled = untracked(this.disabled) ?? false;
            if (
                registration?.value === value &&
                registration.label === label &&
                registration.disabled === disabled
            ) {
                return;
            }
            registration?.unregister();
            registration = {
                value,
                label,
                disabled,
                unregister: this.root.registerItem({
                    value,
                    label,
                    disabled,
                    element: host,
                }),
            };
        });
        inject(DestroyRef).onDestroy(() => registration?.unregister());
        // within the popup only: a list that mounts before it is placed never scrolls the page
        afterRenderEffect(() => {
            if (this.state().highlighted) {
                scrollIntoViewWithin(host, this.root.overlay.positioner());
            }
        });
    }

    protected onPointerMove(): void {
        if (!this.state().highlighted) {
            this.root.highlighted.set(this.value());
        }
    }

    protected onClick(event: MouseEvent): void {
        if (!this.state().disabled) {
            this.root.choose(this.value(), "item-press", event);
        }
    }
}
