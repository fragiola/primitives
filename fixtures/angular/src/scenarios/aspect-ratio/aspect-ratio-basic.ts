import { Component, signal, ViewEncapsulation } from "@angular/core";
import { AspectRatio } from "@fragiola/primitives-angular/aspect-ratio";
import { aspectRatio } from "examples-shared/recipes/aspect-ratio";

/** A 16 by 9 picture, one color: the frame's ratio is what the scenario checks. */
const LAKE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%234a7a8c'/%3E%3C/svg%3E";

/** spec/aspect-ratio.md, `/aspect-ratio/basic` */
@Component({
    selector: "[scenario-aspect-ratio-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [AspectRatio],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div [class]="wide() ? 'w-[32rem]' : 'w-80'">
                <div aspectRatio [ratio]="16 / 9" [class]="styles.root">
                    <img [src]="lake" alt="Mountain lake" class="size-full object-cover" />
                </div>
            </div>
            <div class="w-40">
                <div aspectRatio [class]="styles.root">
                    <div role="img" aria-label="Avatar placeholder" class="size-full"></div>
                </div>
            </div>
            <button type="button" (click)="wide.set(!wide())">Widen</button>
        </div>
    `,
})
export class AspectRatioBasic {
    protected readonly styles = aspectRatio;
    protected readonly wide = signal(false);
    protected readonly lake = LAKE;
}
