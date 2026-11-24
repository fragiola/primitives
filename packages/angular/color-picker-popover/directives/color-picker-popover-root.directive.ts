import {
    computed,
    Directive,
    effect,
    input,
    output,
    untracked,
} from "@angular/core";
import {
    createOverlayRoot,
    injectColorPickerBinding,
    type OpenChangeEvent,
    type OverlayActions,
    placementSignal,
} from "@fragiola/primitives-angular/internal";

export interface ColorPickerPopoverState {
    open: boolean;
    disabled: boolean;
}

/**
 * The open state of a ColorPicker's popup (spec/color-picker.md, `/color-picker-popover`):
 * `<ng-container colorPickerPopoverRoot [(open)]="open">`, inside a `[colorPickerRoot]`, on
 * Popover's overlay lifecycle. `close()` and `unmount()` are its actions.
 */
@Directive({
    selector: "[colorPickerPopoverRoot]",
    exportAs: "colorPickerPopoverRoot",
})
export class ColorPickerPopoverRoot implements OverlayActions {
    readonly open = input<boolean | undefined>(undefined);
    readonly openChange = output<boolean>();
    readonly defaultOpen = input(false);
    /** Every requested change with its details, before it happens (`details.cancel()` keeps it). */
    readonly openChangeDetails = output<OpenChangeEvent>();
    /** An opening's or a closing's transition has finished (spec/README.md, "Lifecycle"). */
    readonly openChangeComplete = output<boolean>();

    readonly overlay = createOverlayRoot(
        this,
        (event) => this.openChangeDetails.emit(event),
        "primitives-color-picker-popover",
    );
    private readonly picker = injectColorPickerBinding();
    /** The enclosing ColorPicker is disabled: the trigger opens nothing. */
    readonly disabled = computed(() => this.picker?.disabled() ?? false);
    readonly placed = placementSignal({ side: "bottom", align: "start" });
    readonly state = computed<ColorPickerPopoverState>(() => ({
        open: this.overlay.open(),
        disabled: this.disabled(),
    }));

    constructor() {
        // the popup is part of the picker: focus in it is no blur of the picker's Field (an effect
        // runs before the popup's after-render focus moves in)
        effect((onCleanup) => {
            const positioner = this.overlay.positioner();
            const picker = this.picker;
            if (positioner !== null && picker !== null) {
                onCleanup(untracked(() => picker.registerPopup(positioner)));
            }
        });
    }

    /** Closes the popup (reason `imperative-action`). */
    close(): void {
        this.overlay.close();
    }

    /** Ends a running exit now, or the exit held by `preventUnmountOnClose()`. */
    unmount(): void {
        this.overlay.unmount();
    }
}
