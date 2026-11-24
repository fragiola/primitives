import type { Signal } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import {
    CommandRoot,
    type CommandRootState,
} from "../directives/command-root.directive.ts";

/** The part hook of the enclosing `[commandRoot]`: its state, its text and its pages. */
export function injectCommand(): {
    state: Signal<CommandRootState>;
    inputValue: Signal<string>;
    pages: Signal<readonly string[]>;
} {
    const root = injectEnclosing(CommandRoot, "commandRoot", "injectCommand");
    return { state: root.state, inputValue: root.search, pages: root.pages };
}
