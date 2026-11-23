import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { printList, SKILLS } from "./tags.ts";

/** A TagGroup labelled and described by a Field (spec/tag-group.md, `/tag-group/field`). */
@Component({
    selector: "[scenario-tag-group-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TAG_GROUP_PARTS, Output],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Skills</label>
            <div tagGroupRoot selectionMode="multiple" (valueChange)="value.set(print($event))" [class]="styles.root">
                <div tagGroupList [class]="styles.list">${tagGroupTags("tags")}</div>
            </div>
            <p fieldDescription [class]="fieldStyles.description">Your strongest skills.</p>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class TagGroupField {
    protected readonly styles = tagGroup;
    protected readonly fieldStyles = field;
    protected readonly print = printList;
    protected readonly tags = SKILLS;
    protected readonly value = signal<string | undefined>(undefined);
}
