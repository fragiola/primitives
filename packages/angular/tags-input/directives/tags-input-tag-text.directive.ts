import { computed, Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { TagsInputTag } from "./tags-input-tag.directive.ts";

/** A Tag's text (the consumer's content): `<span tagsInputTagText>`; hidden while it is edited. */
@Directive({
    selector: "[tagsInputTagText]",
    exportAs: "tagsInputTagText",
    host: {
        "[attr.hidden]": "state().editing ? '' : null",
        "data-primitives-part": "tags-input-tag-text",
    },
})
export class TagsInputTagText {
    private readonly tag = injectEnclosing(
        TagsInputTag,
        "tagsInputTag",
        "tagsInputTagText",
    );
    readonly state = computed(() => ({ editing: this.tag.state().editing }));
}
