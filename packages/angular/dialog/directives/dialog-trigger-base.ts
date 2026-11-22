import {
    computed,
    Directive,
    type InputSignal,
    type InputSignalWithTransform,
    inject,
} from "@angular/core";
import {
    dataValues,
    type OverlayHandle,
    overlayTrigger,
} from "@fragiola/primitives-angular/internal";
import { DialogRootBase } from "./dialog-root-base.ts";

export interface DialogTriggerState {
    open: boolean;
    disabled: boolean;
}

/**
 * What a Dialog's and an AlertDialog's triggers share (spec/dialog.md, "Detached triggers"): each
 * declares the inputs, its `handle` typed with its component's handle.
 */
@Directive({
    host: {
        type: "button",
        "aria-haspopup": "dialog",
        "[attr.data-primitives-part]": "part()",
        "[attr.id]": "trigger.id()",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]":
            "state().open ? (trigger.root()?.overlay?.popupId ?? null) : null",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "onClick($event)",
    },
})
export abstract class DialogTriggerBase<
    Payload = unknown,
    Handle extends OverlayHandle<Payload> = OverlayHandle<Payload>,
> {
    // the inputs, declared by each trigger directive (its API, read where it is declared)
    abstract readonly disabled: InputSignalWithTransform<boolean, unknown>;
    abstract readonly handle: InputSignal<Handle | undefined>;
    abstract readonly payload: InputSignal<Payload | undefined>;
    abstract readonly id: InputSignal<string | undefined>;
    protected readonly trigger = overlayTrigger(
        inject<DialogRootBase<Payload>>(DialogRootBase, { optional: true }),
        this,
        { prefix: "primitives-dialog", selector: "dialogTrigger" },
    );
    // named by its root (an AlertDialog's parts are Dialog's), else by its handle's component
    protected readonly part = computed(() => {
        const component =
            this.trigger.root()?.component ??
            (this.handle() as { component?: string } | undefined)?.component ??
            "dialog";
        return `${component}-trigger`;
    });
    readonly state = computed<DialogTriggerState>(() => ({
        open: this.trigger.active(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    protected onClick(event: MouseEvent): void {
        this.trigger
            .root()
            ?.overlay.setOpen(
                !this.trigger.active(),
                "trigger-press",
                event,
                this.trigger.host,
            );
    }
}
