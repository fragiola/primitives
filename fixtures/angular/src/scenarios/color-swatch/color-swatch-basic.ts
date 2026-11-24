import { Component, ViewEncapsulation } from "@angular/core";
import { ColorSwatch } from "@fragiola/primitives-angular/color-swatch";
import { colorSwatch } from "examples-shared/recipes/color-swatch";

/** spec/color-swatch.md, `/color-swatch/basic` */
@Component({
    selector: "[scenario-color-swatch-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorSwatch],
    template: `
        <div class="flex items-center gap-2">
            <div colorSwatch color="#336699" aria-label="Ocean" [class]="styles.root"></div>
            <div colorSwatch color="rgba(255, 0, 0, 0.5)" [class]="styles.root"></div>
            <div colorSwatch color="hsl(120, 100%, 25%)" aria-label="Forest" [class]="styles.root"></div>
        </div>
    `,
})
export class ColorSwatchBasic {
    protected readonly styles = colorSwatch;
}
