import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/context-menu";
import { contextMenu } from "examples-shared/recipes/context-menu";
import { Output } from "../../kit/output.ts";
import { CONTEXT_MENU_PARTS } from "./context-menu-parts.ts";

/** spec/context-menu.md: a file area's menu, at the pointer or from the keyboard. */
@Component({
    selector: "[scenario-context-menu-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [CONTEXT_MENU_PARTS, Output],
    template: `
        <ng-container contextMenuRoot (openChangeDetails)="onOpenChange($event)">
            <div contextMenuTrigger class="h-48 w-96">
                <span>Files</span>
                <div class="flex gap-2">
                    <button type="button">report.pdf</button>
                    <button type="button">notes.txt</button>
                </div>
            </div>
            <ng-container *contextMenuPortal>
                <div contextMenuPositioner [class]="styles.positioner">
                    <div contextMenuPopup aria-label="File actions" [class]="styles.popup">
                        <div contextMenuItem [class]="styles.item" (click)="action.set('Open')">Open</div>
                        <div contextMenuItem [class]="styles.item" (click)="action.set('Rename')">Rename</div>
                        <div contextMenuSeparator [class]="styles.separator"></div>
                        <div contextMenuItem [class]="styles.item" (click)="action.set('Delete')">Delete</div>
                        <ng-container contextMenuSubmenuRoot>
                            <div contextMenuSubmenuTrigger [class]="styles['submenu-trigger']">Share</div>
                            <ng-container *contextMenuPortal>
                                <div contextMenuPositioner [class]="styles.positioner">
                                    <div contextMenuPopup [class]="styles.popup">
                                        <div contextMenuItem [class]="styles.item" (click)="action.set('Email')">Email</div>
                                        <div contextMenuItem [class]="styles.item" (click)="action.set('Link')">Link</div>
                                    </div>
                                </div>
                            </ng-container>
                        </ng-container>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <button type="button" class="mt-2">After area</button>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), action: action() }"></pre>
    `,
})
export class ContextMenuBasic {
    protected readonly styles = contextMenu;
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly action = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }
}
