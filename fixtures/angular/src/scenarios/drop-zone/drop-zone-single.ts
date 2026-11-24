import { Component, ViewEncapsulation } from "@angular/core";
import { DropZoneRoot } from "@fragiola/primitives-angular/drop-zone";
import { Output } from "../../kit/output.ts";
import { DropZoneScenario, dropZoneTemplate } from "./drop-zone-scenario.ts";

/** spec/drop-zone.md, `/drop-zone/single` */
@Component({
    selector: "[scenario-drop-zone-single]",
    encapsulation: ViewEncapsulation.None,
    imports: [DropZoneRoot, Output],
    template: dropZoneTemplate(`[multiple]="false"`),
})
export class DropZoneSingle extends DropZoneScenario {}
