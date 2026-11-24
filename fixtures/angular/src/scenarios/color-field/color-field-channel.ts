import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorFieldInput,
    ColorFieldRoot,
} from "@fragiola/primitives-angular/color-field";
import { colorField } from "examples-shared/recipes/color-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/** spec/color-field.md, `/color-field/channel` */
@Component({
    selector: "[scenario-color-field-channel]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorFieldRoot, ColorFieldInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorFieldRoot channel="hue" defaultValue="hsl(120, 50%, 50%)" locale="en-US" [name]="'hue'" (valueChange)="value.set(css($event))" [class]="styles.root"><input colorFieldInput aria-label="Hue" [class]="styles.input" /></div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), form: form() }"></pre>
    `,
})
export class ColorFieldChannel {
    protected readonly styles = colorField;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly css = (color: Color | null) =>
        color === null ? undefined : formatColor(color);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
