import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorFieldInput,
    ColorFieldRoot,
} from "@fragiola/primitives-angular/color-field";
import { colorField } from "examples-shared/recipes/color-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/** spec/color-field.md, `/color-field/basic` */
@Component({
    selector: "[scenario-color-field-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorFieldRoot, ColorFieldInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <label for="color">Color</label>
            <div colorFieldRoot [id]="'color'" defaultValue="#336699" [name]="'color'" (valueChange)="value.set(hex($event))" [class]="styles.root"><input colorFieldInput [class]="styles.input" /></div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class ColorFieldBasic {
    protected readonly styles = colorField;
    protected readonly value = signal<string | null | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly hex = (color: Color | null) =>
        color === null ? null : formatColor(color, "hex");

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
