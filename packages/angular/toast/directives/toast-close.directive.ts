import { computed, Directive, inject } from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { ToastRoot } from "./toast-root.directive.ts";

/** Closes its toast (spec/toast.md): `<button toastClose>`. */
@Directive({
    selector: "[toastClose]",
    exportAs: "toastClose",
    host: {
        type: "button",
        "data-primitives-part": "toast-close",
        "[attr.data-type]": "data().type",
        "(click)": "$event.defaultPrevented || root.close()",
    },
})
export class ToastClose {
    protected readonly root = inject<ToastRoot>(ToastRoot);
    protected readonly data = computed(() =>
        dataValues({ type: this.root.toast().type }),
    );
}
