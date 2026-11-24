import { computed, Directive, signal } from "@angular/core";
import type { DropZoneDropDetails } from "@fragiola/primitives-angular/drop-zone";
import { dropZone } from "examples-shared/recipes/drop-zone";

const names = (files: File[]) =>
    files.length === 0 ? "none" : files.map((file) => file.name).join(", ");

/** The DropZone of every scenario, with its output (spec/drop-zone.md); `bindings` are its own. */
export function dropZoneTemplate(bindings: string): string {
    return `
        <div dropZoneRoot ${bindings} [announcement]="announce" (fileDrop)="drop.set($event)" (dropTargetChange)="dropTarget.set($event.value)" class="${dropZone.root}"><span>Drop images or PDFs here, or press to choose</span></div>
        <pre fixtureOutput [values]="values()"></pre>
    `;
}

/** The scenarios' state and output. */
@Directive()
export abstract class DropZoneScenario {
    protected readonly drop = signal<DropZoneDropDetails | undefined>(
        undefined,
    );
    protected readonly dropTarget = signal(false);
    protected readonly announce = (details: DropZoneDropDetails) =>
        `${details.acceptedFiles.length} accepted, ${details.rejectedFiles.length} rejected`;
    protected readonly values = computed(() => {
        const drop = this.drop();
        return {
            accepted: drop && names(drop.acceptedFiles),
            rejected: drop && names(drop.rejectedFiles),
            reason: drop?.reason,
            dropTarget: this.dropTarget(),
        };
    });
}
