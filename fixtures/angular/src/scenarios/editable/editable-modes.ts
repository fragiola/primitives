import { Component, computed, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/editable";
import { editable } from "examples-shared/recipes/editable";
import { field } from "examples-shared/recipes/field";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import {
    area,
    EDITABLE_PARTS,
    editTrigger,
    printEnd,
    printText,
    submitTrigger,
} from "./editable-parts.ts";

const LABELS = ["Name", "Role", "Team", "Notes"];

/** One Root of the page, printing its value, commit and revert under its label. */
function mode(
    label: string,
    inputs: string,
    textarea = false,
    trigger?: string,
): string {
    return `<div fieldRoot class="${field.root}"><label fieldLabel class="${field.label}">${label}</label><div editableRoot ${inputs} (valueChange)="print('${label} value', printText($event))" (valueCommit)="end('${label} commit', $event)" (valueRevert)="end('${label} revert', $event)" class="${editable.root}">${area(textarea)}${trigger === undefined ? "" : `${editTrigger(`Edit ${trigger}`)}${submitTrigger(`Save ${trigger}`)}`}</div></div>`;
}

/** Every activation and submit mode (spec/editable.md, `/editable/modes`). */
@Component({
    selector: "[scenario-editable-modes]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, EDITABLE_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            ${mode("Name", `[defaultValue]="'Ana'" [activationMode]="'dblclick'" [submitMode]="'enter'"`)}
            ${mode("Role", `[defaultValue]="'Designer'" [activationMode]="'click'" [submitMode]="'blur'"`)}
            ${mode("Team", `[defaultValue]="'Core'" [activationMode]="'none'" [submitMode]="'none'"`, false, "team")}
            ${mode("Notes", `[defaultValue]="'First line'"`, true)}
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="values()"></pre>
    `,
})
export class EditableModes {
    protected readonly printText = printText;
    private readonly printed = signal<Record<string, string>>({});
    protected readonly values = computed(() => {
        const printed = this.printed();
        return Object.fromEntries(
            LABELS.flatMap((label) =>
                ["value", "commit", "revert"].map((kind) => {
                    const key = `${label} ${kind}`;
                    return [key, printed[key]];
                }),
            ),
        );
    });

    protected print(key: string, text: string): void {
        this.printed.update((current) => ({ ...current, [key]: text }));
    }

    protected end(key: string, event: ValueChangeEvent<string>): void {
        this.print(key, printEnd(event));
    }
}
