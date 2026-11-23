import { Component } from "@angular/core";
import {
    MeterIndicator,
    MeterLabel,
    MeterRoot,
    MeterTrack,
    MeterValue,
} from "@fragiola/primitives-angular/meter";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

// Storage and battery: a disk's use written in gigabytes (`format`), and a charge written as a
// percentage of the range, Meter's default (spec/meter.md).
@Component({
    selector: "example-storage-meter",
    imports: [MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator],
    template: `
        <div [class]="styles.stack">
            <div meterRoot [value]="384" [max]="512" [format]="gigabytes" [class]="styles.root">
                <span meterLabel [class]="styles.label">Storage</span>
                <span meterValue [class]="styles.value"></span>
                <div meterTrack [class]="styles.track"><div meterIndicator [class]="styles.indicator"></div></div>
            </div>
            <div meterRoot [value]="60" [class]="styles.root">
                <span meterLabel [class]="styles.label">Battery</span>
                <span meterValue [class]="styles.value"></span>
                <div meterTrack [class]="styles.track"><div meterIndicator [class]="styles.indicator"></div></div>
            </div>
        </div>
    `,
})
export default class StorageMeter {
    protected readonly styles = styles;
    protected readonly gigabytes = GIGABYTES;
}
