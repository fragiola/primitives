import { Component, ViewEncapsulation } from "@angular/core";
import { Output } from "../../kit/output.ts";
import { FILE_UPLOAD_PARTS } from "./file-upload-parts.ts";
import {
    FileUploadScenario,
    fileUploadTemplate,
} from "./file-upload-scenario.ts";

/** spec/file-upload.md, `/file-upload/disabled` */
@Component({
    selector: "[scenario-file-upload-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [FILE_UPLOAD_PARTS, Output],
    template: fileUploadTemplate(`[disabled]="true"`),
})
export class FileUploadDisabled extends FileUploadScenario {}
