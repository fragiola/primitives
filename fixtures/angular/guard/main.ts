// The bundle guard's app (scripts/check-bundle.ts): it imports two components, Dialog and Tabs,
// from the package's built entries, and its bundle must hold nothing else.
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
    DialogBackdrop,
    DialogClose,
    DialogDescription,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@fragiola/primitives-angular/dialog";
import {
    TabsIndicator,
    TabsList,
    TabsPanel,
    TabsRoot,
    TabsTab,
} from "@fragiola/primitives-angular/tabs";

@Component({
    selector: "[guard-app]",
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        DialogTitle,
        DialogDescription,
        DialogClose,
        TabsRoot,
        TabsList,
        TabsTab,
        TabsIndicator,
        TabsPanel,
    ],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger>Open</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop></div>
                <div dialogPopup>
                    <h2 dialogTitle>Title</h2>
                    <p dialogDescription>Description</p>
                    <button dialogClose>Close</button>
                </div>
            </ng-container>
        </ng-container>
        <div tabsRoot defaultValue="a">
            <div tabsList aria-label="Tabs">
                <button tabsTab value="a">A</button>
                <button tabsTab value="b">B</button>
                <span *tabsIndicator></span>
            </div>
            <div *tabsPanel="'a'">A</div>
            <div *tabsPanel="'b'">B</div>
        </div>
    `,
})
class GuardApp {}

bootstrapApplication(GuardApp).catch((error: unknown) => console.error(error));
