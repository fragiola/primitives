import { computed, Directive, effect, input, untracked } from "@angular/core";
import {
    injectEnclosing,
    injectHost,
    injectId,
} from "@fragiola/primitives-angular/internal";
import { FieldRoot } from "./field-root.directive.ts";

/**
 * Describes the field's control: listed in its `aria-describedby` (spec/field.md):
 * `<p fieldDescription>We never share it.</p>`.
 */
@Directive({
    selector: "[fieldDescription]",
    exportAs: "fieldDescription",
    host: {
        "data-primitives-part": "field-description",
        "[attr.id]": "resolvedId()",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "field.data().disabled",
    },
})
export class FieldDescription {
    readonly id = input<string | undefined>(undefined);
    protected readonly field = injectEnclosing(
        FieldRoot,
        "fieldRoot",
        "FieldDescription",
    );
    private readonly generated = injectId("primitives-field-description");
    protected readonly resolvedId = computed(() => this.id() ?? this.generated);
    readonly state = this.field.state;

    constructor() {
        const host = injectHost();
        // the id on the element before it is listed: the control's `aria-describedby` reads it
        effect((onCleanup) => {
            host.id = this.resolvedId();
            onCleanup(untracked(() => this.field.registerMessage(host)));
        });
    }
}
