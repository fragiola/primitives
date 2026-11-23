import { Component, signal, ViewEncapsulation } from "@angular/core";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { Output } from "../../kit/output.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { CATEGORIES, printList } from "./tags.ts";

/** A controlled multiple selection (spec/tag-group.md, `/tag-group/selection`). */
@Component({
    selector: "[scenario-tag-group-selection]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAG_GROUP_PARTS, Output],
    template: `
        <div tagGroupRoot selectionMode="multiple" [value]="value()" (valueChange)="value.set($event)" (valueChangeDetails)="reason.set($event.details.reason)" [class]="styles.root">
            <span tagGroupLabel [class]="styles.label">Interests</span>
            <div tagGroupList [class]="styles.list">${tagGroupTags("tags")}</div>
        </div>
        <pre fixtureOutput [values]="{ value: print(value()), reason: reason() }"></pre>
    `,
})
export class TagGroupSelection {
    protected readonly styles = tagGroup;
    protected readonly print = printList;
    protected readonly tags = CATEGORIES;
    protected readonly value = signal<readonly string[]>(["gaming"]);
    protected readonly reason = signal<string | undefined>(undefined);
}
