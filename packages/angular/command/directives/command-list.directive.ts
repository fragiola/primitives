import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { CommandRoot } from "./command-root.directive.ts";

export interface CommandListState {
    empty: boolean;
    loading: boolean;
}

/** The `listbox` of Items, always displayed (spec/command.md): `<div commandList>`. */
@Directive({
    selector: "[commandList]",
    exportAs: "commandList",
    host: {
        role: "listbox",
        // a scrolling list is no Tab stop of its own (Chromium's focusable scrollers): the Input
        // keeps the focus
        tabindex: "-1",
        "data-primitives-part": "command-list",
        "[attr.id]": "root.listId",
        "[attr.aria-busy]": "state().loading ? 'true' : null",
        "[attr.data-empty]": "data().empty",
        "[attr.data-loading]": "data().loading",
    },
})
export class CommandList {
    protected readonly root = inject(CommandRoot);
    readonly state = computed<CommandListState>(() => ({
        empty: this.root.shownCount() === 0,
        loading: this.root.loading(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        registerHost(this.root.list);
    }
}
