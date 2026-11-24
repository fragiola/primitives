import { Component, signal, ViewEncapsulation } from "@angular/core";
import { injectAsyncList } from "@fragiola/primitives-angular/async-list";
import { command } from "examples-shared/recipes/command";
import { Output } from "../../kit/output.ts";
import { loadLabels } from "../virtual-lists/items.ts";
import { COMMAND_PARTS } from "./command-parts.ts";

/** spec/command.md, `/command/async`: the results load for the text, filtered by the loader. */
@Component({
    selector: "[scenario-command-async]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMMAND_PARTS, Output],
    template: `
        <div commandRoot [class]="styles.root" [filter]="null" [loading]="list.loading()" [inputValue]="text()" (inputValueChange)="change($event)">
            <input commandInput aria-label="Command" [class]="styles.input" />
            <div commandLoading [class]="styles.loading">Loading…</div>
            <div commandEmpty [class]="styles.empty">No results.</div>
            <div commandList [class]="styles.list">@for (label of list.items(); track label) {<div commandItem [value]="label" [class]="styles.item">{{ label }}</div>}</div>
        </div>
        <pre fixtureOutput [values]="{ count: list.items().length, filter: list.loading() ? undefined : list.filterText() }"></pre>
    `,
})
export class CommandAsync {
    protected readonly styles = command;
    protected readonly list = injectAsyncList({ load: loadLabels });
    protected readonly text = signal("");

    protected change(next: string): void {
        this.text.set(next);
        this.list.setFilterText(next);
    }
}
