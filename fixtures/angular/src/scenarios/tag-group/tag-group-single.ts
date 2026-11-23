import { Component, signal, ViewEncapsulation } from "@angular/core";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { Output } from "../../kit/output.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { printList, SORTS } from "./tags.ts";

/** An uncontrolled single selection (spec/tag-group.md, `/tag-group/single`). */
@Component({
    selector: "[scenario-tag-group-single]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAG_GROUP_PARTS, Output],
    template: `
        <div tagGroupRoot selectionMode="single" (valueChange)="value.set(print($event))" [class]="styles.root">
            <span tagGroupLabel [class]="styles.label">Sort</span>
            <div tagGroupList [class]="styles.list">${tagGroupTags("tags")}</div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class TagGroupSingle {
    protected readonly styles = tagGroup;
    protected readonly print = printList;
    protected readonly tags = SORTS;
    protected readonly value = signal<string | undefined>(undefined);
}
