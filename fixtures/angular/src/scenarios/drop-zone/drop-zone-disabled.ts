import { Component, ViewEncapsulation } from "@angular/core";
import { DropZoneRoot } from "@fragiola/primitives-angular/drop-zone";
import { Output } from "../../kit/output.ts";
import { DropZoneScenario, dropZoneTemplate } from "./drop-zone-scenario.ts";

/** spec/drop-zone.md, `/drop-zone/disabled` */
@Component({
    selector: "[scenario-drop-zone-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [DropZoneRoot, Output],
    template: dropZoneTemplate(`[accept]="'image/*,.pdf'" [disabled]="true"`),
})
export class DropZoneDisabled extends DropZoneScenario {}
