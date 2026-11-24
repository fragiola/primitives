import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import { hasCascadeChildren } from "@fragiola/primitives/cascade";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { isInSafeArea } from "@fragiola/primitives/pointer";
import { dataValues, injectHost } from "@fragiola/primitives-angular/internal";
import { CascadeSelectLevel } from "./cascade-select-level.directive.ts";
import {
    CascadeSelectRoot,
    samePath,
} from "./cascade-select-root.directive.ts";

export interface CascadeSelectItemState {
    highlighted: boolean;
    selected: boolean;
    disabled: boolean;
    hasChildren: boolean;
    expanded: boolean;
}

// Menu's SubmenuTrigger default (spec/menu.md): the hover time before a parent opens its level.
const HOVER_DELAY = 100;

/**
 * An `option` (spec/cascade-select.md): `<div cascadeSelectItem [value]="item.value">`, inside a
 * Level. A parent opens its level, a leaf is chosen; a disabled item can be highlighted, never
 * chosen.
 */
@Directive({
    selector: "[cascadeSelectItem]",
    exportAs: "cascadeSelectItem",
    host: {
        role: "option",
        "data-primitives-part": "cascade-select-item",
        "[attr.id]": "root.itemId(level.depth(), value())",
        "[attr.aria-selected]": "state().selected ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.aria-controls]":
            "state().expanded ? root.levelId(level.depth() + 1) : null",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-has-children]": "data()['has-children']",
        "[attr.data-expanded]": "data().expanded",
        "(pointermove)": "onPointerMove($event)",
        "(pointerleave)": "onPointerLeave($event)",
        // the trigger keeps DOM focus
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class CascadeSelectItem {
    protected readonly root = inject(CascadeSelectRoot);
    protected readonly level = inject(CascadeSelectLevel);
    /** The entry's `value` among its Level's items. */
    readonly value = input.required<string>();
    private readonly entry = computed(() =>
        this.level.items().find((item) => item.value === this.value()),
    );
    /** Its path: the active path above its level, then its value. */
    private readonly path = computed(() => [
        ...this.root.active().slice(0, this.level.depth()),
        this.value(),
    ]);
    readonly state = computed<CascadeSelectItemState>(() => {
        const depth = this.level.depth();
        const value = this.value();
        const active = this.root.active();
        const hasChildren = hasCascadeChildren(this.entry());
        return {
            highlighted: active.length - 1 === depth && active[depth] === value,
            selected: samePath(
                this.root.selected().slice(0, depth + 1),
                this.path(),
            ),
            disabled: this.entry()?.disabled ?? false,
            hasChildren,
            expanded:
                hasChildren &&
                active[depth] === value &&
                depth + 1 < this.root.levels().length,
        };
    });
    protected readonly data = computed(() => {
        const { hasChildren, ...state } = this.state();
        return dataValues({ ...state, "has-children": hasChildren });
    });
    private readonly host = injectHost();
    // the pointer's last position over the item: where a jump left it (a leave event carries the
    // new position, already over the next item)
    private lastPoint: { x: number; y: number } | null = null;

    constructor() {
        // within the popup only: a level that mounts before it is placed never scrolls the page
        afterRenderEffect(() => {
            if (this.state().highlighted) {
                scrollIntoViewWithin(this.host, this.root.overlay.positioner());
            }
        });
    }

    private startHover(): void {
        const root = this.root;
        clearTimeout(root.hoverTimer);
        root.hoverTimer = undefined;
        const { hasChildren, disabled } = this.state();
        if (!hasChildren || disabled) {
            return;
        }
        const path = this.path();
        root.hoverTimer = setTimeout(() => {
            root.hoverTimer = undefined;
            root.setActive(path, true);
        }, HOVER_DELAY);
    }

    protected onPointerMove(event: PointerEvent): void {
        const root = this.root;
        this.lastPoint = { x: event.clientX, y: event.clientY };
        const depth = this.level.depth();
        const value = this.value();
        const active = root.active();
        // the safe area: the pointer travels from an open parent of this level to its level
        const area = root.safeArea;
        const levelElement =
            area === null
                ? null
                : this.host.ownerDocument.getElementById(
                      root.levelId(area.depth),
                  );
        if (
            area !== null &&
            levelElement &&
            !levelElement.hidden &&
            area.depth === depth + 1 &&
            active[depth] !== value &&
            isInSafeArea(
                { x: event.clientX, y: event.clientY },
                area,
                levelElement,
            )
        ) {
            return;
        }
        const { highlighted, expanded } = this.state();
        if (highlighted) {
            if (!root.peek() && root.hoverTimer === undefined) {
                this.startHover();
            }
            return;
        }
        if (active[depth] === value && expanded) {
            // back on the open parent: its level stays open
            root.setActive(this.path(), true);
            return;
        }
        root.setActive(this.path());
        this.startHover();
    }

    protected onPointerLeave(event: PointerEvent): void {
        const root = this.root;
        clearTimeout(root.hoverTimer);
        root.hoverTimer = undefined;
        const from = this.lastPoint ?? { x: event.clientX, y: event.clientY };
        this.lastPoint = null;
        if (this.state().expanded) {
            root.safeArea = { ...from, depth: this.level.depth() + 1 };
        }
    }

    protected onClick(event: MouseEvent): void {
        const root = this.root;
        const { disabled, hasChildren } = this.state();
        if (disabled) {
            return;
        }
        clearTimeout(root.hoverTimer);
        root.hoverTimer = undefined;
        const path = this.path();
        if (hasChildren) {
            if (root.changeOnSelect()) {
                root.choose(path, "item-press", event, true);
            }
            root.setActive(path, true);
            return;
        }
        root.choose(path, "item-press", event);
    }
}
