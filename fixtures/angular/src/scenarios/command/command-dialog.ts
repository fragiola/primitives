import {
    Component,
    DestroyRef,
    DOCUMENT,
    inject,
    signal,
    ViewEncapsulation,
} from "@angular/core";
import { command } from "examples-shared/recipes/command";
import { dialog } from "examples-shared/recipes/dialog";
import { Output } from "../../kit/output.ts";
import { DIALOG_PARTS } from "../dialog/dialog-parts.ts";
import { COMMAND_ITEMS, COMMAND_PARTS } from "./command-parts.ts";

/**
 * spec/command.md, `/command/dialog`: the Command dialog is a composition, a Command inside a
 * Dialog opened by the app's own Cmd/Ctrl+K.
 */
@Component({
    selector: "[scenario-command-dialog]",
    encapsulation: ViewEncapsulation.None,
    imports: [COMMAND_PARTS, DIALOG_PARTS, Output],
    template: `
        <ng-container dialogRoot [(open)]="open">
            <button dialogTrigger [class]="dialogStyles.trigger">Open command menu</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="dialogStyles.backdrop"></div>
                <div dialogPopup aria-label="Command menu" [class]="dialogStyles.popup">
                    <div commandRoot [class]="styles.root">
                        <input commandInput aria-label="Command" [class]="styles.input" />
                        <div commandEmpty [class]="styles.empty">No results.</div>
                        <div commandList [class]="styles.list">${COMMAND_ITEMS}</div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), ran: ran() }"></pre>
    `,
})
export class CommandDialog {
    protected readonly styles = command;
    protected readonly dialogStyles = dialog;
    protected readonly open = signal(false);
    protected readonly ran = signal<string | undefined>(undefined);

    constructor() {
        const document = inject(DOCUMENT);
        const toggle = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === "k" &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                this.open.update((current) => !current);
            }
        };
        document.addEventListener("keydown", toggle);
        inject(DestroyRef).onDestroy(() =>
            document.removeEventListener("keydown", toggle),
        );
    }

    protected run(value: string): void {
        this.ran.set(value);
        this.open.set(false);
    }
}
