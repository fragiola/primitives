import { computed, Directive, inject, input } from "@angular/core";
import { dataValues, labelId } from "@fragiola/primitives-angular/internal";
import { ToastRoot } from "./toast-root.directive.ts";

/** The toast's title (its id is the Root's label): `<h2 toastTitle>{{ toast.title }}</h2>`. */
@Directive({
    selector: "[toastTitle]",
    exportAs: "toastTitle",
    host: {
        "data-primitives-part": "toast-title",
        "[attr.id]": "resolvedId()",
        "[attr.data-type]": "data().type",
    },
})
export class ToastTitle {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject<ToastRoot>(ToastRoot);
    protected readonly resolvedId = labelId(
        this.id,
        this.root.titleId,
        "primitives-toast-title",
    );
    protected readonly data = computed(() =>
        dataValues({ type: this.root.toast().type }),
    );
}
