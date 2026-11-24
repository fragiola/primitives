import { Component, ViewEncapsulation } from "@angular/core";
import { DropZoneRoot } from "@fragiola/primitives-angular/drop-zone";
import { Output } from "../../kit/output.ts";
import { DropZoneScenario, dropZoneTemplate } from "./drop-zone-scenario.ts";

/** spec/drop-zone.md, `/drop-zone/basic` */
@Component({
    selector: "[scenario-drop-zone-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [DropZoneRoot, Output],
    template: dropZoneTemplate(`[accept]="'image/*,.pdf'"`),
})
export class DropZoneBasic extends DropZoneScenario {}
