import { computed, Directive, inject } from "@angular/core";
import { tabsKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    dataValues,
    injectProvidedDirection,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { TabsRoot } from "./tabs-root.directive.ts";

/** The tablist: one tab stop, arrows move between tabs (spec/tabs.md, "Keyboard"). */
@Directive({
    selector: "[tabsList]",
    exportAs: "tabsList",
    host: {
        role: "tablist",
        "data-primitives-part": "tabs-list",
        "[attr.aria-orientation]": "root.orientation()",
        "[attr.data-orientation]": "data().orientation",
        "(keydown)": "onKeyDown($event)",
    },
})
export class TabsList {
    /** A DirectionProvider's direction, else `null` (the computed one is read). */
    private readonly direction = injectProvidedDirection();
    protected readonly root = inject(TabsRoot);
    readonly state = computed(() => ({ orientation: this.root.orientation() }));
    protected readonly data = computed(() => dataValues(this.state()));
    private readonly list = registerHost(this.root.list);

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        const tabs = [
            ...this.list.querySelectorAll<HTMLElement>('[role="tab"]'),
        ];
        const active = this.list.ownerDocument
            .activeElement as HTMLElement | null;
        const current = active ? tabs.indexOf(active) : -1;
        if (current === -1) {
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const info = root.tabs.get(tabs[current] as HTMLElement);
            if (info && !info.disabled) {
                root.select(info.value, "trigger-press");
            }
            return;
        }
        const index = tabsKeyTarget(event.key, current, tabs.length, {
            orientation: root.orientation(),
            rtl: getDirection(this.list, this.direction()) === "rtl",
            loop: root.loopFocus(),
        });
        if (index === null) {
            return;
        }
        event.preventDefault();
        const target = tabs[index];
        if (target === undefined) {
            return;
        }
        target.focus();
        const info = root.tabs.get(target);
        if (root.activation() === "automatic" && info && !info.disabled) {
            root.select(info.value, "list-navigation");
        }
    }
}
