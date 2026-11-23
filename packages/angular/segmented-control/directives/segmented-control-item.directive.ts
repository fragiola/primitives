import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    input,
    untracked,
} from "@angular/core";
import {
    dataValues,
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import {
    type SegmentedControlOrientation,
    SegmentedControlRoot,
} from "./segmented-control-root.directive.ts";

/** An Item's state, which its ItemText reads (spec/segmented-control.md). */
export interface SegmentedControlItemState {
    checked: boolean;
    disabled: boolean;
    orientation: SegmentedControlOrientation;
}

/**
 * A segment: a `radio` of a `[segmentedControlRoot]` (spec/segmented-control.md):
 * `<button segmentedControlItem value="list"><span segmentedControlItemText>List</span></button>`.
 * A press (or a press on its label) checks and focuses it; the arrows move through the control.
 */
@Directive({
    selector: "[segmentedControlItem]",
    exportAs: "segmentedControlItem",
    host: {
        type: "button",
        role: "radio",
        "data-primitives-part": "segmented-control-item",
        "[attr.id]": "id() ?? null",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-checked]": "state().checked ? 'true' : 'false'",
        "[attr.tabindex]": "holdsTabStop() ? 0 : -1",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-orientation]": "data().orientation",
        "(click)": "onClick($event)",
        "(keydown)": "onKeyDown($event)",
        "(keyup)": "onKeyUp($event)",
    },
})
export class SegmentedControlItem {
    /** Its value in the control. */
    readonly value = input.required<string>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly id = input<string | undefined>(undefined);

    private readonly control = injectEnclosing(
        SegmentedControlRoot,
        "segmentedControlRoot",
        "segmentedControlItem",
    );
    private readonly host = injectHost<HTMLButtonElement>();
    readonly state = computed<SegmentedControlItemState>(() => ({
        checked: this.control.checked() === this.value(),
        disabled: this.disabled() || this.control.isDisabled(),
        orientation: this.control.orientation(),
    }));
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            checked: state.checked,
            unchecked: !state.checked,
            disabled: state.disabled,
            orientation: state.orientation,
        });
    });
    /** The roving tab stop: before the Items registered, the checked one. */
    protected readonly holdsTabStop = computed(
        () => this.control.tabStop() === this.value() && !this.state().disabled,
    );

    constructor() {
        const host = this.host;
        const control = this.control;
        effect((onCleanup) => {
            const entry = {
                value: this.value(),
                disabled: this.state().disabled,
                element: host,
            };
            onCleanup(untracked(() => control.register(entry)));
        });
    }

    protected onClick(event: MouseEvent): void {
        if (this.state().disabled) {
            return;
        }
        // a press (or a press on its label) checks and focuses it
        this.host.focus();
        this.control.select(this.value(), "item-press", event);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        // a native radio does not check on Enter (a button would click)
        if (event.key === "Enter") {
            event.preventDefault();
            return;
        }
        // Space checks it here, as a key: its click on key up is prevented
        if (event.key === " ") {
            event.preventDefault();
            if (!this.state().disabled) {
                this.control.select(this.value(), "keyboard", event);
            }
            return;
        }
        if (this.control.navigate(event.key, this.host, event)) {
            event.preventDefault();
        }
    }

    protected onKeyUp(event: KeyboardEvent): void {
        if (event.key === " ") {
            event.preventDefault();
        }
    }
}
