import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorAreaInput,
    ColorAreaRoot,
    ColorAreaThumb,
} from "@fragiola/primitives-angular/color-area";
import { colorArea } from "examples-shared/recipes/color-area";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/** spec/color-area.md, `/color-area/basic`; also `/color-area/rtl` (the page sets `dir`). */
@Component({
    selector: "[scenario-color-area-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorAreaRoot, ColorAreaThumb, ColorAreaInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorAreaRoot aria-label="Color" defaultValue="hsb(210, 50%, 50%)" xChannel="saturation" yChannel="brightness" locale="en-US" data-testid="area" (valueChange)="value.set(hsb($event))" (valueCommit)="committed.set(hsb($event))" [class]="styles.root">
                <div colorAreaThumb [class]="styles.thumb"><input colorAreaInput axis="x" name="saturation" aria-label="Saturation" [class]="styles.input" /><input colorAreaInput axis="y" name="brightness" aria-label="Brightness" [class]="styles.input" /></div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), committed: committed(), form: form() }"></pre>
    `,
})
export class ColorAreaBasic {
    protected readonly styles = colorArea;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly committed = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly hsb = (color: Color) => formatColor(color, "hsb");

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
