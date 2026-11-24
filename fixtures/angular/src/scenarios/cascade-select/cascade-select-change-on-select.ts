import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    CascadeItem,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/cascade-select";
import { cascadeSelect } from "examples-shared/recipes/cascade-select";
import { Output } from "../../kit/output.ts";
import { LOCATION_ITEMS, pathText } from "./location-items.ts";
import {
    CASCADE_SELECT_PARTS,
    DEPTHS,
    LOCATION_SELECT,
} from "./location-select.ts";

/** spec/cascade-select.md, `/cascade-select/change-on-select` */
@Component({
    selector: "[scenario-cascade-select-change-on-select]",
    encapsulation: ViewEncapsulation.None,
    imports: [CASCADE_SELECT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <label for="location" class="text-sm font-medium">Location</label>
            ${LOCATION_SELECT}
        </div>
        <pre fixtureOutput [values]="{ value: value(), open: open() }"></pre>
    `,
})
export class CascadeSelectChangeOnSelect {
    protected readonly styles = cascadeSelect;
    protected readonly items: readonly CascadeItem[] = LOCATION_ITEMS;
    protected readonly depths = DEPTHS;
    protected readonly triggerId = "location";
    protected readonly name: string | undefined = undefined;
    protected readonly required = false;
    protected readonly changeOnSelect = true;
    protected readonly defaultValue: readonly string[] = ["americas"];
    protected readonly separator: string | undefined = undefined;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly open = signal(false);

    protected onValueChange(path: readonly string[]): void {
        this.value.set(pathText(path));
    }

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
    }
}
