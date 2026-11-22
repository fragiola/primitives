import { computed, Directive, inject, input } from "@angular/core";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    dataValues,
    positionOverlay,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { MenuRootBase } from "./menu-root-base.ts";

export interface MenuPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

/**
 * Places a menu level: below its trigger, or at the end side of its submenu trigger.
 * `<div menuPositioner>`.
 */
@Directive({
    selector: "[menuPositioner]",
    exportAs: "menuPositioner",
    host: {
        role: "presentation",
        "[attr.data-primitives-part]": "level.part('positioner')",
        "[attr.hidden]": "level.overlay.presence.mounted() ? null : ''",
        "[attr.data-open]": "data().open",
        "[attr.data-closed]": "data().closed",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
        "[attr.data-nested]": "data().nested",
        // a modal menu blocks the pointer outside; its levels take it back (spec/menu.md)
        "[style.pointer-events]": "level.isModal() ? 'auto' : null",
    },
})
export class MenuPositioner {
    protected readonly level = inject(MenuRootBase);
    readonly side = input<Side | undefined>(undefined);
    readonly align = input<Align | undefined>(undefined);
    readonly sideOffset = input<number | undefined>(undefined);
    readonly alignOffset = input<number | undefined>(undefined);
    readonly collisionPadding = input<number | undefined>(undefined);
    readonly anchor = input<Element | null | undefined>(undefined);
    readonly state = computed<MenuPositionerState>(() => ({
        open: this.level.overlay.open(),
        ...this.level.placed(),
    }));
    protected readonly data = computed(() =>
        dataValues({
            ...this.state(),
            closed: !this.state().open,
            nested: this.level.nested,
        }),
    );

    constructor() {
        const overlay = this.level.overlay;
        const positioner = registerHost(overlay.positioner);
        positionOverlay(
            this,
            this.level.nested
                ? { side: "inline-end", align: "start" }
                : { side: "bottom", align: "start" },
            {
                // a context menu's point, else the trigger
                anchor: computed(
                    () => this.level.anchor() ?? overlay.trigger(),
                ),
                positioner,
                mounted: overlay.presence.mounted,
            },
            this.level.placed,
        );
    }
}
