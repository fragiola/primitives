import { Component, signal, ViewEncapsulation } from "@angular/core";
import { command } from "examples-shared/recipes/command";
import { Output } from "../../kit/output.ts";
import { COMMAND_ITEMS, COMMAND_PARTS } from "./command-parts.ts";

/** A value or keyword starting with the text, case ignored. */
function startsWith(
    value: string,
    search: string,
    keywords: readonly string[],
): number {
    const query = search.toLowerCase();
    return [value, ...keywords].some((text) =>
        text.toLowerCase().startsWith(query),
    )
        ? 1
        : 0;
}

/** spec/command.md, `/command/filter` */
@Component({
    selector: "[scenario-command-filter]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMMAND_PARTS, Output],
    template: `
        <div commandRoot [class]="styles.root" [filter]="filter">
            <input commandInput aria-label="Command" [class]="styles.input" />
            <div commandEmpty [class]="styles.empty">No results.</div>
            <div commandList [class]="styles.list">${COMMAND_ITEMS}<div commandItem [value]="'Ask AI'" [forceMount]="true" (itemSelect)="run($event.value)" [class]="styles.item">Ask AI</div></div>
        </div>
        <pre fixtureOutput [values]="{ ran: ran() }"></pre>
    `,
})
export class CommandFilter {
    protected readonly styles = command;
    protected readonly filter = startsWith;
    protected readonly ran = signal<string | undefined>(undefined);

    protected run(value: string): void {
        this.ran.set(value);
    }
}
