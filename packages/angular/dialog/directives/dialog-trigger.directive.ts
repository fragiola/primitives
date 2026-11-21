import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { DialogRoot } from "./dialog-root.directive.ts";

export interface DialogTriggerState {
    open: boolean;
    disabled: boolean;
}

/** Opens and closes the dialog (reason `trigger-press`): `<button dialogTrigger>`. */
@Directive({
    selector: "[dialogTrigger]",
    exportAs: "dialogTrigger",
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "data-primitives-part": "dialog-trigger",
        "[attr.id]": "root.overlay.triggerId",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "state().open ? root.overlay.popupId : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "root.overlay.setOpen(!state().open, 'trigger-press')",
    },
})
export class DialogTrigger {
    protected readonly root = inject(DialogRoot);
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly state = computed<DialogTriggerState>(() => ({
        open: this.root.overlay.open(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    constructor() {
        registerHost(this.root.overlay.trigger);
    }
}
