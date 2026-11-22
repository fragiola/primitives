import { Component, signal } from "@angular/core";
import { Button } from "@fragiola/primitives-angular/button";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { Form } from "@fragiola/primitives-angular/form";
import { RadioIndicator, RadioRoot } from "@fragiola/primitives-angular/radio";
import { RadioGroup } from "@fragiola/primitives-angular/radio-group";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { styles } from "./styles.ts";

const CHANNELS = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "post", label: "Post" },
];

// Contact settings: a Form with a required RadioGroup and a Switch, each in a Field. The arrows
// move through the radios, Space toggles the switch; saving with no channel chosen focuses the
// first radio and shows the field's error (spec/radio-group.md, spec/switch.md, spec/field.md).
@Component({
    selector: "example-contact-settings",
    imports: [
        Form,
        FieldRoot,
        FieldLabel,
        FieldDescription,
        FieldError,
        RadioGroup,
        RadioRoot,
        RadioIndicator,
        SwitchRoot,
        SwitchThumb,
        Button,
    ],
    template: `
        <form formRoot aria-label="Contact settings" (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'contact'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Contact by</label>
                <div radioGroup required [class]="styles.group">
                    @for (channel of channels; track channel.value) {
                        <div [class]="styles.row">
                            <button radioRoot [id]="channel.value" [value]="channel.value" [class]="styles.radio.root"><span *radioIndicator [class]="styles.radio.indicator"></span></button>
                            <label [for]="channel.value">{{ channel.label }}</label>
                        </div>
                    }
                </div>
                <p fieldDescription [class]="styles.field.description">How we reach you.</p>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Choose how we reach you.</div>
            </div>
            <div fieldRoot [name]="'alerts'" [class]="styles.field.root">
                <div [class]="styles.row">
                    <button switchRoot uncheckedValue="off" [class]="styles.switch.root"><span switchThumb [class]="styles.switch.thumb"></span></button>
                    <label fieldLabel [class]="styles.field.label">Email alerts</label>
                </div>
                <p fieldDescription [class]="styles.field.description">A weekly digest.</p>
            </div>
            <button button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ status() }}</p>
        </form>
    `,
})
export default class ContactSettings {
    protected readonly styles = styles;
    protected readonly channels = CHANNELS;
    protected readonly status = signal("");

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.status.set(
            `Saved: ${String(data.get("contact"))}, alerts ${String(data.get("alerts"))}.`,
        );
    }
}
