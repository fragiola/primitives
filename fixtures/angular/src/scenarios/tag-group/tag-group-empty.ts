import { Component, ViewEncapsulation } from "@angular/core";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { TAG_GROUP_PARTS } from "./tag-group-parts.ts";

/** A group with no tag (spec/tag-group.md, `/tag-group/empty`). */
@Component({
    selector: "[scenario-tag-group-empty]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAG_GROUP_PARTS],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div tagGroupRoot [class]="styles.root">
                <span tagGroupLabel [class]="styles.label">Categories</span>
                <div tagGroupList [class]="styles.list"></div>
                <p class="text-xs">No categories.</p>
            </div>
            <button type="button">After</button>
        </div>
    `,
})
export class TagGroupEmpty {
    protected readonly styles = tagGroup;
}
