import { Component, computed, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/command";
import { command } from "examples-shared/recipes/command";
import { Output } from "../../kit/output.ts";
import { COMMAND_PARTS } from "./command-parts.ts";

/** spec/command.md, `/command/pages` */
@Component({
    selector: "[scenario-command-pages]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMMAND_PARTS, Output],
    template: `
        <div commandRoot [class]="styles.root" [pages]="pages()" (pagesChangeDetails)="change($event)">
            <input commandInput aria-label="Command" [class]="styles.input" />
            <div commandEmpty [class]="styles.empty">No results.</div>
            <div commandList [class]="styles.list">
                @if (page() === undefined) {
                    <div commandItem [value]="'Search projects…'" (itemSelect)="push('projects')" [class]="styles.item">Search projects…</div>
                    <div commandItem [value]="'Change theme…'" (itemSelect)="push('theme')" [class]="styles.item">Change theme…</div>
                }
                @if (page() === "projects") {
                    @for (project of projects; track project) {
                        <div commandItem [value]="project" (itemSelect)="ran.set($event.value)" [class]="styles.item">{{ project }}</div>
                    }
                }
                @if (page() === "theme") {
                    @for (theme of themes; track theme) {
                        <div commandItem [value]="theme" (itemSelect)="ran.set($event.value)" [class]="styles.item">{{ theme }}</div>
                    }
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ pages: pages().join('/'), ran: ran(), reason: reason() }"></pre>
    `,
})
export class CommandPages {
    protected readonly styles = command;
    protected readonly projects = ["Primitives", "Tree", "Splitter"];
    protected readonly themes = ["Light", "Dark"];
    protected readonly pages = signal<readonly string[]>([]);
    protected readonly page = computed(() => this.pages().at(-1));
    protected readonly ran = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected push(next: string): void {
        this.pages.set([...this.pages(), next]);
    }

    protected change(event: ValueChangeEvent<string[]>): void {
        this.pages.set(event.value);
        this.reason.set(event.details.reason);
    }
}
