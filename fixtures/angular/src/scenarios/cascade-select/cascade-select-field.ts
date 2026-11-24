import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    CascadeItem,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/cascade-select";
import { cascadeSelect } from "examples-shared/recipes/cascade-select";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { LOCATION_ITEMS, pathText } from "./location-items.ts";
import {
    CASCADE_SELECT_PARTS,
    DEPTHS,
    LOCATION_SELECT,
} from "./location-select.ts";

/** spec/cascade-select.md, `/cascade-select/field` */
@Component({
    selector: "[scenario-cascade-select-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, CASCADE_SELECT_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'place'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Place</label>
                ${LOCATION_SELECT}
                <p fieldDescription [class]="fieldStyles.description">Where you live.</p>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class CascadeSelectField {
    protected readonly styles = cascadeSelect;
    protected readonly fieldStyles = field;
    protected readonly items: readonly CascadeItem[] = LOCATION_ITEMS;
    protected readonly depths = DEPTHS;
    protected readonly triggerId: string | null = null;
    protected readonly name: string | undefined = undefined;
    protected readonly required = false;
    protected readonly changeOnSelect = false;
    protected readonly defaultValue: readonly string[] = [
        "europe",
        "france",
        "lyon",
    ];
    protected readonly separator = " / ";
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected onValueChange(path: readonly string[]): void {
        this.value.set(pathText(path));
    }

    protected onOpenChange(_event: OpenChangeEvent): void {}

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
