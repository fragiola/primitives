import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import {
    ColorPickerPopoverRoot,
    type ColorPickerPopoverState,
} from "./color-picker-popover-root.directive.ts";

/**
 * Opens the picker's popup; its content is the app's (a `[colorSwatch]` of the picker's color):
 * `<button colorPickerPopoverTrigger>`. Disabled while the picker is.
 */
@Directive({
    selector: "[colorPickerPopoverTrigger]",
    exportAs: "colorPickerPopoverTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "data-primitives-part": "color-picker-popover-trigger",
        "[attr.id]": "root.overlay.triggerId",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "state().open ? root.overlay.popupId : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick($event)",
    },
})
export class ColorPickerPopoverTrigger {
    protected readonly root = inject(ColorPickerPopoverRoot);
    readonly state = computed<ColorPickerPopoverState>(() => this.root.state());
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    constructor() {
        registerHost(this.root.overlay.singleTrigger);
    }

    protected onClick(event: MouseEvent): void {
        if (this.root.disabled()) {
            return;
        }
        this.root.overlay.setOpen(!this.state().open, "trigger-press", event);
    }
}
