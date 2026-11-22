import { computed, Directive, inject, input, signal } from "@angular/core";
import { injectId } from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

/** One item: a Trigger with its Content, or a Link: `<li navigationMenuItem [value]="'products'">`. */
@Directive({
    selector: "[navigationMenuItem]",
    exportAs: "navigationMenuItem",
    host: { "data-primitives-part": "navigation-menu-item" },
})
export class NavigationMenuItem {
    protected readonly root = inject(NavigationMenuRoot);
    private readonly generated = injectId("primitives-navigation-menu-item");
    /** The item's value (generated when not given). */
    readonly value = input<string | undefined>(undefined);
    readonly itemValue = computed(() => this.value() ?? this.generated);
    readonly contentId = `${this.generated}-content`;
    readonly content = signal<HTMLElement | null>(null);
    readonly open = computed(() => this.root.current() === this.itemValue());
}
