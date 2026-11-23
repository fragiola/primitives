import { Directive, input } from "@angular/core";
import {
    injectEnclosing,
    labelId,
} from "@fragiola/primitives-angular/internal";
import { TagGroupRoot } from "./tag-group-root.directive.ts";

/** Names the List (spec/tag-group.md): `<span tagGroupLabel>`; in a Field, the `Field.Label` does. */
@Directive({
    selector: "[tagGroupLabel]",
    exportAs: "tagGroupLabel",
    host: {
        "data-primitives-part": "tag-group-label",
        "[attr.id]": "resolvedId()",
    },
})
export class TagGroupLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly resolvedId = labelId(
        this.id,
        injectEnclosing(TagGroupRoot, "tagGroupRoot", "tagGroupLabel").labelId,
        "primitives-tag-group-label",
    );
}
