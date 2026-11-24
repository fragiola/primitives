import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandRoot,
    CommandVirtualList,
    CommandVirtualRow,
} from "@fragiola/primitives-angular/command-virtual";
import { command } from "examples-shared/recipes/command";
import { Output } from "../../kit/output.ts";
import { ITEMS } from "../virtual-lists/items.ts";

const ENTRIES = ITEMS.map((item) => ({
    value: item.label,
    disabled: item.disabled,
}));

/** spec/command.md, `/command-virtual/basic`: 10 000 Items, only those in view rendered. */
@Component({
    selector: "[scenario-command-virtual-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommandRoot,
        CommandInput,
        CommandEmpty,
        CommandVirtualList,
        CommandVirtualRow,
        CommandItem,
        Output,
    ],
    template: `
        <div commandRoot [class]="styles.root">
            <input commandInput aria-label="Command" [class]="styles.input" />
            <div commandEmpty [class]="styles.empty">No results.</div>
            <div commandVirtualList #list="commandVirtualList" [items]="entries" [itemSize]="36" [class]="styles.list">@for (row of list.rows(); track row.index) {<div commandItem [commandVirtualRow]="row" [value]="row.item.value" [disabled]="row.item.disabled === true" (itemSelect)="ran.set($event.value)" [class]="styles.item">{{ row.item.value }}</div>}</div>
        </div>
        <pre fixtureOutput [values]="{ ran: ran() }"></pre>
    `,
})
export class CommandVirtualBasic {
    protected readonly styles = command;
    protected readonly entries = ENTRIES;
    protected readonly ran = signal<string | undefined>(undefined);
}
