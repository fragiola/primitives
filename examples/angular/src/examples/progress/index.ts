import { Component, signal } from "@angular/core";
import {
    ProgressIndicator,
    ProgressLabel,
    ProgressRoot,
    ProgressTrack,
    ProgressValue,
} from "@fragiola/primitives-angular/progress";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

// Uploads and storage: an upload's progress written as a percentage, which "Add 25%" moves and
// "Unknown" makes indeterminate; a disk's use written in gigabytes (`format`, spec/progress.md).
@Component({
    selector: "example-upload-progress",
    imports: [
        ProgressRoot,
        ProgressLabel,
        ProgressValue,
        ProgressTrack,
        ProgressIndicator,
    ],
    template: `
        <div [class]="styles.stack">
            <div progressRoot [value]="value()" [class]="styles.root">
                <span progressLabel [class]="styles.label">Upload</span>
                <span progressValue [class]="styles.value"></span>
                <div progressTrack [class]="styles.track"><div progressIndicator [class]="styles.indicator"></div></div>
            </div>
            <div [class]="styles.row">
                <button type="button" (click)="add()" [class]="styles.button">Add 25%</button>
                <button type="button" (click)="value.set(null)" [class]="styles.button">Unknown</button>
                <button type="button" (click)="value.set(0)" [class]="styles.button">Reset</button>
            </div>
            <div progressRoot [value]="128" max="512" [format]="gigabytes" [class]="styles.root">
                <span progressLabel [class]="styles.label">Storage</span>
                <span progressValue [class]="styles.value"></span>
                <div progressTrack [class]="styles.track"><div progressIndicator [class]="styles.indicator"></div></div>
            </div>
        </div>
    `,
})
export default class UploadProgress {
    protected readonly styles = styles;
    protected readonly gigabytes = GIGABYTES;
    protected readonly value = signal<number | null>(25);

    protected add(): void {
        this.value.update((current) => Math.min((current ?? 0) + 25, 100));
    }
}
