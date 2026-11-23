import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { TagGroupTag } from "./tag-group-tag.directive.ts";

/**
 * A Tag's one `gridcell`, around its content and its RemoveButton (spec/tag-group.md, "Anatomy"):
 * `<div tagGroupTagCell>`. A part of its own: a directive renders no element inside its Tag.
 */
@Directive({
    selector: "[tagGroupTagCell]",
    exportAs: "tagGroupTagCell",
    host: {
        role: "gridcell",
        "data-primitives-part": "tag-group-tag-cell",
    },
})
export class TagGroupTagCell {
    constructor() {
        injectEnclosing(TagGroupTag, "tagGroupTag", "tagGroupTagCell");
    }
}
