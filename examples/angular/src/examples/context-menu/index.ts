import { Component, signal } from "@angular/core";
import {
    ContextMenuItem,
    ContextMenuPopup,
    ContextMenuPortal,
    ContextMenuPositioner,
    ContextMenuRoot,
    ContextMenuSeparator,
    ContextMenuSubmenuRoot,
    ContextMenuSubmenuTrigger,
    ContextMenuTrigger,
} from "@fragiola/primitives-angular/context-menu";
import { styles } from "./styles.ts";

// A file manager: right-click a file (or long-press it, or focus it and press Shift+F10) to open
// its menu at the pointer; "Share" opens a submenu, and the last action shows below
// (spec/context-menu.md).
@Component({
    selector: "example-file-manager",
    imports: [
        ContextMenuRoot,
        ContextMenuTrigger,
        ContextMenuPortal,
        ContextMenuPositioner,
        ContextMenuPopup,
        ContextMenuItem,
        ContextMenuSeparator,
        ContextMenuSubmenuRoot,
        ContextMenuSubmenuTrigger,
    ],
    template: `
        <div [class]="styles.stack">
            <ng-container contextMenuRoot>
                <div contextMenuTrigger [class]="styles.trigger">
                    <span [class]="styles.heading">Documents</span>
                    <ul [class]="styles.files">
                        @for (name of files; track name) {
                            <li><button type="button" [class]="styles.file" (focus)="file.set(name)" (pointerdown)="file.set(name)">{{ name }}</button></li>
                        }
                    </ul>
                </div>
                <ng-container *contextMenuPortal>
                    <div contextMenuPositioner [class]="styles.positioner">
                        <div contextMenuPopup aria-label="File actions" [class]="styles.popup">
                            <div contextMenuItem [class]="styles.item" (click)="act('Opened')">Open</div>
                            <div contextMenuItem [class]="styles.item" (click)="act('Renamed')">Rename</div>
                            <ng-container contextMenuSubmenuRoot>
                                <div contextMenuSubmenuTrigger [class]="styles.submenuTrigger">Share</div>
                                <ng-container *contextMenuPortal>
                                    <div contextMenuPositioner [class]="styles.positioner">
                                        <div contextMenuPopup [class]="styles.popup">
                                            <div contextMenuItem [class]="styles.item" (click)="act('Emailed')">Email</div>
                                            <div contextMenuItem [class]="styles.item" (click)="act('Link copied')">Copy link</div>
                                        </div>
                                    </div>
                                </ng-container>
                            </ng-container>
                            <div contextMenuSeparator [class]="styles.separator"></div>
                            <div contextMenuItem [class]="styles.item" (click)="act('Deleted')">Delete</div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <p [class]="styles.status">{{ status() }}</p>
        </div>
    `,
})
export default class FileManager {
    protected readonly styles = styles;
    protected readonly files = ["report.pdf", "notes.txt", "photo.png"];
    protected readonly file = signal("report.pdf");
    protected readonly status = signal("Right-click a file");

    protected act(action: string): void {
        this.status.set(`${action}: ${this.file()}`);
    }
}
