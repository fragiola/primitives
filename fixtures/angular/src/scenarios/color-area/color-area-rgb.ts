import { Component, ViewEncapsulation } from "@angular/core";
import {
    ColorAreaInput,
    ColorAreaRoot,
    ColorAreaThumb,
} from "@fragiola/primitives-angular/color-area";
import { colorArea } from "examples-shared/recipes/color-area";

/** spec/color-area.md, `/color-area/rgb` */
@Component({
    selector: "[scenario-color-area-rgb]",
    encapsulation: ViewEncapsulation.None,
    imports: [ColorAreaRoot, ColorAreaThumb, ColorAreaInput],
    template: `
        <div colorAreaRoot aria-label="Red and green" defaultValue="rgb(0, 0, 128)" xChannel="red" yChannel="green" data-testid="area" [class]="styles.root">
            <div colorAreaThumb [class]="styles.thumb"><input colorAreaInput axis="x" aria-label="Red" [class]="styles.input" /><input colorAreaInput axis="y" aria-label="Green" [class]="styles.input" /></div>
        </div>
    `,
})
export class ColorAreaRgb {
    protected readonly styles = colorArea;
}
