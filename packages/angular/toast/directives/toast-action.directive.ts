import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { ToastRoot } from "./toast-root.directive.ts";

/** A toast's action, a button the app wires (spec/toast.md): `<button toastAction (click)>`. */
@Directive({
    selector: "[toastAction]",
    exportAs: "toastAction",
    host: {
        type: "button",
        "data-primitives-part": "toast-action",
        "[attr.data-type]": "data().type",
    },
})
export class ToastAction {
    private readonly root = inject<ToastRoot>(ToastRoot);
    protected readonly data = computed(() =>
        dataValues({ type: this.root.toast().type }),
    );
}
