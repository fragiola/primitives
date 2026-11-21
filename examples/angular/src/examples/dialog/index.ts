import { Component } from "@angular/core";
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
import { styles } from "./styles.ts";

// An "Edit profile" dialog: the trigger opens it, focus moves to the first field, Tab stays
// inside, and Escape, a press outside or either button closes it, focus back on the trigger.
@Component({
    selector: "example-edit-profile",
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        DialogTitle,
        DialogDescription,
        DialogClose,
    ],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger [class]="styles.trigger">Edit profile</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">Edit profile</h2>
                    <p dialogDescription [class]="styles.description">
                        Change how others see you. Save when you are done.
                    </p>
                    <div [class]="styles.form">
                        <label [class]="styles.field">
                            Name
                            <input [class]="styles.input" value="Ada Lovelace" />
                        </label>
                        <label [class]="styles.field">
                            Username
                            <input [class]="styles.input" value="ada" />
                        </label>
                    </div>
                    <div [class]="styles.actions">
                        <button dialogClose [class]="styles.close">Cancel</button>
                        <button dialogClose [class]="styles.close">Save</button>
                    </div>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export default class EditProfile {
    protected readonly styles = styles;
}
