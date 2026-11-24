import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    CascadeItem,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/cascade-select";
import { cascadeSelect } from "examples-shared/recipes/cascade-select";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { LOCATION_ITEMS, pathText } from "./location-items.ts";
import {
    CASCADE_SELECT_PARTS,
    DEPTHS,
    LOCATION_SELECT,
} from "./location-select.ts";

/** spec/cascade-select.md, `/cascade-select/basic` */
@Component({
    selector: "[scenario-cascade-select-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [CASCADE_SELECT_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label for="location" class="text-sm font-medium">Location</label>
            ${LOCATION_SELECT}
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), open: open(), reason: reason(), form: form() }"></pre>
    `,
})
export class CascadeSelectBasic {
    protected readonly styles = cascadeSelect;
    protected readonly items: readonly CascadeItem[] = LOCATION_ITEMS;
    protected readonly depths = DEPTHS;
    protected readonly triggerId = "location";
    protected readonly name = "location";
    protected readonly required = true;
    protected readonly changeOnSelect = false;
    protected readonly defaultValue: readonly string[] = [];
    protected readonly separator = " / ";
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected onValueChange(path: readonly string[]): void {
        this.value.set(pathText(path));
    }

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
