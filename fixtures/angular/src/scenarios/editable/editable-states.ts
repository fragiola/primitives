import { Component, ViewEncapsulation } from "@angular/core";
import { editable } from "examples-shared/recipes/editable";
import { field } from "examples-shared/recipes/field";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { area, EDITABLE_PARTS, editTrigger } from "./editable-parts.ts";

/** A placeholder, a disabled and a read-only Editable (spec/editable.md, `/editable/states`). */
@Component({
    selector: "[scenario-editable-states]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, EDITABLE_PARTS],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">Subtitle</label>
                <div editableRoot [placeholder]="'Add a subtitle'" [maxLength]="12" class="${editable.root}">${area()}${editTrigger("Edit subtitle")}</div>
            </div>
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">Owner</label>
                <div editableRoot [disabled]="true" [defaultValue]="'Ana'" class="${editable.root}">${area()}${editTrigger("Edit owner")}</div>
            </div>
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">Created</label>
                <div editableRoot [readOnly]="true" [defaultValue]="'2026-11-23'" class="${editable.root}">${area()}${editTrigger("Edit created")}</div>
            </div>
        </div>
    `,
})
export class EditableStates {}
