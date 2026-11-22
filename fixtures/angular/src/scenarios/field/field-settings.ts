import { Component, signal, ViewEncapsulation } from "@angular/core";
import { RadioIndicator, RadioRoot } from "@fragiola/primitives-angular/radio";
import { RadioGroup } from "@fragiola/primitives-angular/radio-group";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { field } from "examples-shared/recipes/field";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import { switchControl } from "examples-shared/recipes/switch";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "./field-parts.ts";

/** A RadioGroup and a Switch inside fields, in a native form (spec/field.md). */
@Component({
    selector: "[scenario-field-settings]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        FIELD_PARTS,
        RadioGroup,
        RadioRoot,
        RadioIndicator,
        SwitchRoot,
        SwitchThumb,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'contact'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Contact by</label>
                <div radioGroup [required]="true" [class]="groupStyles.root">
                    <label class="flex items-center gap-2 text-sm"><button radioRoot [value]="'email'" [class]="radioStyles.root"><span *radioIndicator [class]="radioStyles.indicator"></span></button>Email</label>
                    <label class="flex items-center gap-2 text-sm"><button radioRoot [value]="'phone'" [class]="radioStyles.root"><span *radioIndicator [class]="radioStyles.indicator"></span></button>Phone</label>
                </div>
                <p fieldDescription [class]="styles.description">How we reach you.</p>
                <div *fieldError [class]="styles.error">Choose how we reach you.</div>
            </div>
            <div fieldRoot [name]="'alerts'" [class]="styles.root">
                <div class="flex items-center gap-2">
                    <button switchRoot [uncheckedValue]="'off'" [class]="switchStyles.root"><span switchThumb [class]="switchStyles.thumb"></span></button>
                    <label fieldLabel [class]="styles.label">Email alerts</label>
                </div>
                <p fieldDescription [class]="styles.description">A weekly digest.</p>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class FieldSettings {
    protected readonly styles = field;
    protected readonly groupStyles = radioGroup;
    protected readonly radioStyles = radio;
    protected readonly switchStyles = switchControl;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
