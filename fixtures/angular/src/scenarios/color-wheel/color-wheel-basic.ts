import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorWheelRoot,
    ColorWheelThumb,
    ColorWheelTrack,
} from "@fragiola/primitives-angular/color-wheel";
import { colorWheel } from "examples-shared/recipes/color-wheel";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/** spec/color-wheel.md, `/color-wheel/basic` */
@Component({
    selector: "[scenario-color-wheel-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorWheelRoot, ColorWheelTrack, ColorWheelThumb, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorWheelRoot defaultValue="hsl(90, 100%, 50%)" [name]="'color'" locale="en-US" [outerRadius]="100" [innerRadius]="76" data-testid="wheel" (valueChange)="value.set(css($event))" (valueCommit)="committed.set(css($event))" [class]="styles.root">
                <div colorWheelTrack [class]="styles.track"></div>
                <div colorWheelThumb aria-label="Hue" [class]="styles.thumb"></div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), committed: committed(), form: form() }"></pre>
    `,
})
export class ColorWheelBasic {
    protected readonly styles = colorWheel;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly committed = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly css = (color: Color) => formatColor(color);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
