import { Component, signal, ViewEncapsulation } from "@angular/core";
import { type Color, formatColor } from "@fragiola/primitives/color";
import {
    ColorSliderLabel,
    ColorSliderOutput,
    ColorSliderRoot,
    ColorSliderThumb,
    ColorSliderTrack,
} from "@fragiola/primitives-angular/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";

/** spec/color-slider.md, `/color-slider/basic`; also `/color-slider/rtl` (the page sets `dir`). */
@Component({
    selector: "[scenario-color-slider-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ColorSliderRoot,
        ColorSliderLabel,
        ColorSliderOutput,
        ColorSliderTrack,
        ColorSliderThumb,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div colorSliderRoot channel="hue" defaultValue="hsl(0, 100%, 50%)" [name]="'color'" locale="en-US" (valueChange)="value.set(css($event))" (valueCommit)="committed.set(css($event))" [class]="styles.root">
                <div colorSliderLabel [class]="styles.label">Hue</div>
                <div colorSliderTrack data-testid="track" [class]="styles.track"><div colorSliderThumb [class]="styles.thumb"></div></div>
                <output colorSliderOutput [class]="styles.output"></output>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: value(), committed: committed(), form: form() }"></pre>
    `,
})
export class ColorSliderBasic {
    protected readonly styles = colorSlider;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly committed = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);
    protected readonly css = (color: Color) => formatColor(color);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
