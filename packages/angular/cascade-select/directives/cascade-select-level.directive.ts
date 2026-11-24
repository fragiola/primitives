import { computed, Directive, inject, input } from "@angular/core";
import type { CascadeItem } from "@fragiola/primitives/cascade";
import { CascadeSelectRoot } from "./cascade-select-root.directive.ts";

export interface CascadeSelectLevelState {
    open: boolean;
    depth: number;
}

const NO_ITEMS: readonly CascadeItem[] = [];

/**
 * The `listbox` of one depth; `hidden` while that depth is not open (spec/cascade-select.md):
 * `<div cascadeSelectLevel [depth]="0" #level="cascadeSelectLevel">`, its Items rendered from
 * `level.items()` (none while the level is not open), in order.
 */
@Directive({
    selector: "[cascadeSelectLevel]",
    exportAs: "cascadeSelectLevel",
    host: {
        role: "listbox",
        "data-primitives-part": "cascade-select-level",
        "[attr.id]": "root.levelId(depth())",
        "[attr.hidden]": "state().open ? null : ''",
        "[attr.aria-labelledby]": "labelledBy()",
        "[attr.data-depth]": "String(depth())",
    },
})
export class CascadeSelectLevel {
    protected readonly root = inject(CascadeSelectRoot);
    /** The level's depth, `0` for the first. */
    readonly depth = input.required<number>();
    readonly state = computed<CascadeSelectLevelState>(() => ({
        open: this.depth() < this.root.levels().length,
        depth: this.depth(),
    }));
    /** The level's entries while it is open, else none. */
    readonly items = computed(
        () => this.root.levels()[this.depth()] ?? NO_ITEMS,
    );
    protected readonly String = String;

    /** The first level: the trigger's id, read at render; a deeper one: its parent option. */
    protected labelledBy(): string | null {
        const depth = this.depth();
        if (depth === 0) {
            return this.root.overlay.trigger()?.id || null;
        }
        const parent = this.root.active()[depth - 1];
        return parent === undefined
            ? null
            : this.root.itemId(depth - 1, parent);
    }
}
