import { afterNextRender, computed, Directive, inject } from "@angular/core";
import {
    cascadeKeyAction,
    hasCascadeChildren,
} from "@fragiola/primitives/cascade";
import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    dataValues,
    injectFlush,
    injectProvidedDirection,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import {
    CascadeSelectRoot,
    firstItem,
} from "./cascade-select-root.directive.ts";

export interface CascadeSelectTriggerState {
    open: boolean;
    disabled: boolean;
    placeholder: boolean;
}

// Within this time after a typed character, Space continues the typeahead instead of choosing.
const TYPEAHEAD_SPACE = 500;

/**
 * The select-only `combobox`: `<button cascadeSelectTrigger>`. It keeps DOM focus while open; the
 * highlighted item of the deepest open level is announced with `aria-activedescendant`
 * (spec/cascade-select.md, "Keyboard").
 */
@Directive({
    selector: "[cascadeSelectTrigger]",
    exportAs: "cascadeSelectTrigger",
    host: {
        type: "button",
        role: "combobox",
        "aria-haspopup": "listbox",
        "data-primitives-part": "cascade-select-trigger",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "controls()",
        "[attr.aria-activedescendant]": "activeId()",
        "[attr.aria-required]": "root.required() ? 'true' : null",
        "[attr.data-invalid]": "root.field.data().invalid",
        "[attr.data-valid]": "root.field.data().valid",
        "[attr.data-dirty]": "root.field.data().dirty",
        "[attr.data-touched]": "root.field.data().touched",
        "[attr.data-filled]": "root.field.data().filled",
        "[attr.data-focused]": "root.field.data().focused",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-placeholder]": "data().placeholder",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class CascadeSelectTrigger {
    protected readonly root = inject(CascadeSelectRoot);
    readonly state = computed<CascadeSelectTriggerState>(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.isDisabled(),
        placeholder: this.root.selected().length === 0,
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly controls = computed(() =>
        this.state().open
            ? this.root
                  .levels()
                  .map((_, depth) => this.root.levelId(depth))
                  .join(" ")
            : null,
    );
    protected readonly activeId = computed(() => {
        const active = this.root.active();
        const depth = active.length - 1;
        const highlighted = active[depth];
        return this.state().open && highlighted !== undefined
            ? this.root.itemId(depth, highlighted)
            : null;
    });
    protected readonly String = String;
    private readonly typeahead = createTypeahead();
    private lastTyped = 0;
    private readonly flush = injectFlush();
    private readonly direction = injectProvidedDirection();
    private readonly host: HTMLElement;

    constructor() {
        const host = registerHost(this.root.overlay.singleTrigger);
        this.host = host;
        const { field } = this.root;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        // the consumer's own id wins (the label's `for` points at it)
        afterNextRender(() => {
            if (host.id === "") {
                host.id = this.root.overlay.triggerId;
            }
            this.root.triggerElementId.set(host.id);
        });
    }

    protected onClick(event: MouseEvent): void {
        const root = this.root;
        if (root.overlay.open()) {
            root.overlay.setOpen(false, "trigger-press", event);
        } else {
            root.openOn(root.initialActive(), "trigger-press", event);
        }
    }

    /** Moves the highlight, rendered before the next key. */
    private setActive(active: readonly string[]): void {
        this.root.setActive(active);
        this.flush();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        if (root.isDisabled()) {
            return;
        }
        const items = root.items();
        const open = root.overlay.open();
        const active = root.active();
        const depth = active.length - 1;
        const level = root.levels()[depth] ?? [];
        const highlighted = active[depth];
        const index = level.findIndex((item) => item.value === highlighted);
        const current = level[index];
        const typing =
            event.key === " " && Date.now() - this.lastTyped < TYPEAHEAD_SPACE;
        if ((event.key.length === 1 && event.key !== " ") || typing) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            event.preventDefault();
            this.lastTyped = Date.now();
            if (!open) {
                const value = root.selected();
                const match = this.typeahead.match(
                    event.key,
                    items.map((item) => item.label),
                    items.findIndex((item) => item.value === value[0]),
                );
                const target = items[match]?.value;
                if (target !== undefined) {
                    root.openOn([target], "list-navigation", event);
                }
                return;
            }
            const match = this.typeahead.match(
                event.key,
                level.map((item) => item.label),
                index,
            );
            const target = level[match]?.value;
            if (target !== undefined) {
                this.setActive([...active.slice(0, depth), target]);
            }
            return;
        }
        if (!open) {
            switch (event.key) {
                case "ArrowDown":
                case "ArrowUp":
                case "Enter":
                case " ":
                    event.preventDefault();
                    root.openOn(root.initialActive(), "list-navigation", event);
                    return;
                case "Home":
                case "End": {
                    event.preventDefault();
                    const target = (
                        event.key === "Home" ? items[0] : items.at(-1)
                    )?.value;
                    root.openOn(
                        target === undefined ? [] : [target],
                        "list-navigation",
                        event,
                    );
                    return;
                }
                default:
                    return;
            }
        }
        if (event.key === "Tab") {
            // APG: Tab chooses the highlighted option when it can be chosen, then focus moves on
            if (
                current !== undefined &&
                !current.disabled &&
                (root.changeOnSelect() || !hasCascadeChildren(current))
            ) {
                root.choose(active, "focus-out", event);
            } else {
                root.overlay.setOpen(false, "focus-out", event);
            }
            return;
        }
        const highlightAt = (next: number) => {
            const target = level[next]?.value;
            if (target !== undefined) {
                this.setActive([...active.slice(0, depth), target]);
            }
        };
        const enterLevel = () => {
            if (current === undefined || current.disabled) {
                return;
            }
            const first = firstItem(current.children ?? []);
            if (first !== undefined) {
                this.setActive([...active, first]);
            }
        };
        const rtl = getDirection(this.host, this.direction()) === "rtl";
        switch (cascadeKeyAction(event, rtl)) {
            case "next":
                event.preventDefault();
                highlightAt(Math.min(index + 1, level.length - 1));
                return;
            case "previous":
                event.preventDefault();
                highlightAt(Math.max(index - 1, 0));
                return;
            case "first":
                event.preventDefault();
                highlightAt(0);
                return;
            case "last":
                event.preventDefault();
                highlightAt(level.length - 1);
                return;
            case "open-level":
                event.preventDefault();
                enterLevel();
                return;
            case "close-level":
                event.preventDefault();
                if (depth > 0) {
                    this.setActive(active.slice(0, -1));
                }
                return;
            case "choose":
                event.preventDefault();
                if (current === undefined || current.disabled) {
                    return;
                }
                if (hasCascadeChildren(current)) {
                    if (root.changeOnSelect()) {
                        root.choose(active, "item-press", event, true);
                    }
                    enterLevel();
                    return;
                }
                root.choose(active, "item-press", event);
                return;
            default:
        }
    }
}
