import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    ProgressIndicator,
    ProgressLabel,
    ProgressRoot,
    ProgressTrack,
    ProgressValue,
} from "@fragiola/primitives-angular/progress";
import { progress } from "examples-shared/recipes/progress";
import { Output } from "../../kit/output.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

/** An upload's progress the fixture moves, and a disk's use in gigabytes (spec/progress.md). */
@Component({
    selector: "[scenario-progress-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ProgressRoot,
        ProgressLabel,
        ProgressValue,
        ProgressTrack,
        ProgressIndicator,
        Output,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div progressRoot [value]="value()" [locale]="'en-US'" [class]="styles.root">
                <span progressLabel [class]="styles.label">Upload</span>
                <span progressValue [class]="styles.value"></span>
                <div progressTrack [class]="styles.track"><div progressIndicator [class]="styles.indicator"></div></div>
            </div>
            <div class="flex gap-2">
                <button type="button" (click)="value.set(100)">Complete</button>
                <button type="button" (click)="value.set(null)">Unknown</button>
            </div>
            <div progressRoot [value]="128" [min]="0" [max]="512" [format]="gigabytes" [locale]="'en-US'" [class]="styles.root">
                <span progressLabel [class]="styles.label">Storage</span>
                <span progressValue [class]="styles.value"></span>
                <div progressTrack [class]="styles.track"><div progressIndicator [class]="styles.indicator"></div></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class ProgressBasic {
    protected readonly styles = progress;
    protected readonly gigabytes = GIGABYTES;
    protected readonly value = signal<number | null>(40);
}
