import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    MeterIndicator,
    MeterLabel,
    MeterRoot,
    MeterTrack,
    MeterValue,
} from "@fragiola/primitives-angular/meter";
import { meter } from "examples-shared/recipes/meter";
import { Output } from "../../kit/output.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

/** spec/meter.md, `/meter/basic` (and `?dir=rtl`): a battery the fixture drains, a disk's use. */
@Component({
    selector: "[scenario-meter-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        MeterRoot,
        MeterLabel,
        MeterValue,
        MeterTrack,
        MeterIndicator,
        Output,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div meterRoot [value]="value()" [locale]="'en-US'" [class]="styles.root">
                <span meterLabel [class]="styles.label">Battery</span>
                <span meterValue [class]="styles.value"></span>
                <div meterTrack [class]="styles.track"><div meterIndicator [class]="styles.indicator"></div></div>
            </div>
            <div class="flex gap-2">
                <button type="button" (click)="value.set(10)">Drain</button>
                <button type="button" (click)="value.set(140)">Overcharge</button>
            </div>
            <div meterRoot [value]="384" [max]="512" [format]="gigabytes" [locale]="'en-US'" [class]="styles.root">
                <span meterLabel [class]="styles.label">Storage</span>
                <span meterValue [class]="styles.value"></span>
                <div meterTrack [class]="styles.track"><div meterIndicator [class]="styles.indicator"></div></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class MeterBasic {
    protected readonly styles = meter;
    protected readonly gigabytes = GIGABYTES;
    protected readonly value = signal(60);
}
