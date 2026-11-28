import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ClipboardStatusChangeEvent } from "@fragiola/primitives-angular/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";
import { Output } from "../../kit/output.ts";
import { CLIPBOARD_ICONS, CLIPBOARD_PARTS } from "./clipboard-parts.ts";

/** A share link whose Trigger's visible label follows the status (spec/clipboard.md, `/clipboard/label`). */
@Component({
    selector: "[scenario-clipboard-label]",
    encapsulation: ViewEncapsulation.None,
    imports: [CLIPBOARD_PARTS, Output],
    template: `
        <div clipboardRoot [value]="'https://fragiola.com/primitives'" [timeout]="1000" (statusChange)="changed($event)" class="${clipboard.root}"><button clipboardTrigger #trigger="clipboardTrigger" class="${clipboard["labelled-trigger"]}">${CLIPBOARD_ICONS}{{ trigger.state().copied ? "Copied" : "Copy link" }}</button></div>
        <pre fixtureOutput [values]="{ status: status() }"></pre>
    `,
})
export class ClipboardLabel {
    protected readonly status = signal<string | undefined>(undefined);

    protected changed(event: ClipboardStatusChangeEvent): void {
        this.status.set(event.status);
    }
}
