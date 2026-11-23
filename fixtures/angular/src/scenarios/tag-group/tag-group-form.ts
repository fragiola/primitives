import { Component, ViewEncapsulation } from "@angular/core";
import { Form } from "@fragiola/primitives-angular/form";
import { field } from "examples-shared/recipes/field";
import { form } from "examples-shared/recipes/form";
import { tagGroup } from "examples-shared/recipes/tag-group";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TAG_GROUP_PARTS, tagGroupTags } from "./tag-group-parts.ts";
import { SKILLS, validateSkills } from "./tags.ts";

/** A TagGroup in a Field of a Form, its first tag disabled (spec/tag-group.md, `/tag-group/form`). */
@Component({
    selector: "[scenario-tag-group-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [Form, FIELD_PARTS, TAG_GROUP_PARTS],
    template: `
        <form formRoot [class]="formStyles.root" (submit)="$event.preventDefault()">
            <div fieldRoot [name]="'skills'" [validate]="validateSkills" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Skills</label>
                <div tagGroupRoot selectionMode="multiple" [disabledKeys]="disabledKeys" [class]="styles.root">
                    <div tagGroupList [class]="styles.list">${tagGroupTags("tags")}</div>
                </div>
                <div *fieldError [class]="fieldStyles.error"></div>
            </div>
            <button type="submit">Submit</button>
        </form>
    `,
})
export class TagGroupForm {
    protected readonly styles = tagGroup;
    protected readonly fieldStyles = field;
    protected readonly formStyles = form;
    protected readonly validateSkills = validateSkills;
    protected readonly tags = SKILLS;
    protected readonly disabledKeys = ["design"];
}
