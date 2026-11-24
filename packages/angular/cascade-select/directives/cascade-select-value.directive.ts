import { computed, Directive, inject, input } from "@angular/core";
import { cascadePathItems } from "@fragiola/primitives/cascade";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { CascadeSelectRoot } from "./cascade-select-root.directive.ts";

/**
 * The chosen path's label, or the placeholder (spec/cascade-select.md): `<span cascadeSelectValue
 * placeholder="Choose a place" separator=" / ">`. Without `separator`, the last chosen item's
 * label; with it, the labels of the whole path joined by it. The directive writes the text (one
 * text node, as React's).
 */
@Directive({
    selector: "[cascadeSelectValue]",
    exportAs: "cascadeSelectValue",
    host: {
        "data-primitives-part": "cascade-select-value",
        "[attr.data-placeholder]": "data().placeholder",
        "[textContent]": "text()",
    },
})
export class CascadeSelectValue {
    private readonly root = inject(CascadeSelectRoot);
    /** Shown while nothing is chosen. */
    readonly placeholder = input("");
    /** Joins the labels of the whole path; without it, the last chosen item's label. */
    readonly separator = input<string | undefined>(undefined);
    private readonly label = computed(() => {
        const labels = (
            cascadePathItems(this.root.items(), this.root.selected()) ?? []
        ).map((item) => item.label);
        if (labels.length === 0) {
            return undefined;
        }
        const separator = this.separator();
        return separator === undefined ? labels.at(-1) : labels.join(separator);
    });
    readonly state = computed(() => ({
        placeholder: this.label() === undefined,
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly text = computed(
        () => this.label() ?? this.placeholder(),
    );
}
