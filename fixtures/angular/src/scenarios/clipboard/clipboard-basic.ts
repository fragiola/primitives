import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ClipboardStatusChangeEvent } from "@fragiola/primitives-angular/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";
import { Output } from "../../kit/output.ts";
import { CLIPBOARD_PARTS, clipboardTrigger } from "./clipboard-parts.ts";

/** An install command to copy (spec/clipboard.md, `/clipboard/basic`). */
@Component({
    selector: "[scenario-clipboard-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [CLIPBOARD_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <label for="install" class="text-sm font-medium">Install command</label>
            <div clipboardRoot [value]="'pnpm add @fragiola/primitives'" [timeout]="1000" [announcement]="'Copied to clipboard'" (statusChange)="changed($event)" class="${clipboard.root}"><input clipboardInput id="install" class="${clipboard.input}" />${clipboardTrigger("Copy install command")}</div>
        </div>
        <pre fixtureOutput [values]="{ status: status(), reason: reason() }"></pre>
    `,
})
export class ClipboardBasic {
    protected readonly status = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected changed(event: ClipboardStatusChangeEvent): void {
        this.status.set(event.status);
        this.reason.set(event.details.reason);
    }
}
