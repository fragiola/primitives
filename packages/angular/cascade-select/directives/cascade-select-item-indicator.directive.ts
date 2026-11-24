import {
    computed,
    Directive,
    type EmbeddedViewRef,
    effect,
    inject,
    input,
    TemplateRef,
    untracked,
    ViewContainerRef,
} from "@angular/core";
import { CascadeSelectItem } from "./cascade-select-item.directive.ts";

/**
 * Marks an item of the chosen path, hidden from assistive technologies (spec/cascade-select.md);
 * structural, so it is rendered only while its item is on the chosen path:
 * `<span *cascadeSelectItemIndicator>✓</span>`, or `*cascadeSelectItemIndicator="true"` to keep
 * it. The directive writes its attributes on the element it renders.
 */
@Directive({
    selector: "[cascadeSelectItemIndicator]",
    exportAs: "cascadeSelectItemIndicator",
})
export class CascadeSelectItemIndicator {
    private readonly item = inject(CascadeSelectItem);
    /** Rendered while the item is not on the chosen path too. */
    readonly keepMounted = input(false, {
        alias: "cascadeSelectItemIndicator",
        // `*cascadeSelectItemIndicator` alone gives "": not kept
        transform: (value: unknown) => value === true || value === "true",
    });
    readonly state = computed(() => ({
        selected: this.item.state().selected,
    }));

    constructor() {
        const template = inject(TemplateRef);
        const container = inject(ViewContainerRef);
        let view: EmbeddedViewRef<unknown> | null = null;
        effect(() => {
            const show = this.state().selected || this.keepMounted();
            untracked(() => {
                if (!show) {
                    container.clear();
                    view = null;
                    return;
                }
                if (view !== null) {
                    return;
                }
                view = container.createEmbeddedView(template);
                for (const node of view.rootNodes as Node[]) {
                    if (node instanceof HTMLElement) {
                        node.setAttribute("aria-hidden", "true");
                        node.setAttribute(
                            "data-primitives-part",
                            "cascade-select-item-indicator",
                        );
                    }
                }
            });
        });
    }
}
