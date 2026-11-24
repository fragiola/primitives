import { Component, signal, ViewEncapsulation } from "@angular/core";
import { command } from "examples-shared/recipes/command";
import { Output } from "../../kit/output.ts";
import { COMMAND_ITEMS, COMMAND_PARTS } from "./command-parts.ts";

/** spec/command.md, `/command/basic` */
@Component({
    selector: "[scenario-command-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMMAND_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <div commandRoot [class]="styles.root" [(inputValue)]="search">
                <input commandInput aria-label="Command" [class]="styles.input" />
                <div commandEmpty [class]="styles.empty">No results.</div>
                <div commandList [class]="styles.list">${COMMAND_ITEMS}</div>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ ran: ran(), search: search() }"></pre>
    `,
})
export class CommandBasic {
    protected readonly styles = command;
    protected readonly ran = signal<string | undefined>(undefined);
    protected readonly search = signal("");

    protected run(value: string): void {
        this.ran.set(value);
    }
}
