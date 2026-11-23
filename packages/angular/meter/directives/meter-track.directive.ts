import { Directive, inject } from "@angular/core";
import { MeterRoot } from "./meter-root.directive.ts";

/** The rail the Indicator fills (spec/meter.md): `<div meterTrack>`. */
@Directive({
    selector: "[meterTrack]",
    exportAs: "meterTrack",
    host: { "data-primitives-part": "meter-track" },
})
export class MeterTrack {
    readonly state = inject(MeterRoot).state;
}
