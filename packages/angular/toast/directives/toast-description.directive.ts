import { computed, Directive, inject, input } from "@angular/core";
import { dataValues, labelId } from "@fragiola/primitives-angular/internal";
import { ToastRoot } from "./toast-root.directive.ts";

/** The toast's description (its id is the Root's label): `<p toastDescription>{{ toast.description }}</p>`. */
@Directive({
    selector: "[toastDescription]",
    exportAs: "toastDescription",
    host: {
        "data-primitives-part": "toast-description",
        "[attr.id]": "resolvedId()",
        "[attr.data-type]": "data().type",
    },
})
export class ToastDescription {
    readonly id = input<string | undefined>(undefined);
    private readonly root = inject<ToastRoot>(ToastRoot);
    protected readonly resolvedId = labelId(
        this.id,
        this.root.descriptionId,
        "primitives-toast-description",
    );
    protected readonly data = computed(() =>
        dataValues({ type: this.root.toast().type }),
    );
}
