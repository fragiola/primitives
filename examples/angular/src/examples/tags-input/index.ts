import { Component, signal } from "@angular/core";
import {
    TagsInputClearTrigger,
    TagsInputControl,
    TagsInputInput,
    type TagsInputInvalidEvent,
    TagsInputRoot,
    TagsInputTag,
    TagsInputTagInput,
    TagsInputTagRemove,
    TagsInputTagText,
} from "@fragiola/primitives-angular/tags-input";
import { styles } from "./styles.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RECIPIENTS = ["ada@example.com", "grace@example.com"];

// Email recipients: Enter, a comma or a paste turns the typed text into recipients
// (spec/tags-input.md). A text that is no address, or one already there, is refused: it stays in
// the field and the message says why. Backspace at the start reaches the last recipient (a second
// one removes it), a double press edits one, and leaving the field adds what was typed.
@Component({
    selector: "example-email-recipients",
    imports: [
        TagsInputRoot,
        TagsInputControl,
        TagsInputTag,
        TagsInputTagText,
        TagsInputTagInput,
        TagsInputTagRemove,
        TagsInputInput,
        TagsInputClearTrigger,
    ],
    template: `
        <div [class]="styles.stack">
            <label for="recipients" [class]="styles.label">To</label>
            <div tagsInputRoot #root="tagsInputRoot" [defaultValue]="recipients" [validate]="validate" editable blurBehavior="add" (valueChange)="message.set('')" (valueInvalid)="explain($event)" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">
                    @for (email of root.tags(); track $index) {
                        <div tagsInputTag [index]="$index" [class]="styles.tag">
                            <span tagsInputTagText [class]="styles.tagText">{{ email }}</span>
                            <input tagsInputTagInput aria-label="Edit recipient" [class]="styles.tagInput" />
                            <button tagsInputTagRemove [attr.aria-label]="'Remove ' + email" [class]="styles.tagRemove">×</button>
                        </div>
                    }
                    <input tagsInputInput id="recipients" [class]="styles.input" />
                </div>
                <button tagsInputClearTrigger aria-label="Clear recipients" [class]="styles.clearTrigger">×</button>
            </div>
            <p role="status" [class]="styles.status">{{ message() }}</p>
        </div>
    `,
})
export default class EmailRecipients {
    protected readonly styles = styles;
    protected readonly recipients = RECIPIENTS;
    protected readonly message = signal("");
    protected readonly validate = (text: string) => EMAIL.test(text);

    protected explain({ value, details }: TagsInputInvalidEvent): void {
        this.message.set(
            details.cause === "duplicate"
                ? `${value} is already a recipient.`
                : `${value} is not an email address.`,
        );
    }
}
