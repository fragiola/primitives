import { Component, signal } from "@angular/core";
import {
    type CascadeItem,
    CascadeSelectItem,
    CascadeSelectItemIndicator,
    CascadeSelectLevel,
    CascadeSelectPopup,
    CascadeSelectPortal,
    CascadeSelectPositioner,
    CascadeSelectRoot,
    CascadeSelectTrigger,
    CascadeSelectValue,
} from "@fragiola/primitives-angular/cascade-select";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const city = (label: string): CascadeItem => ({
    value: label.toLowerCase(),
    label,
});

const PLACES: readonly CascadeItem[] = [
    {
        value: "americas",
        label: "Americas",
        children: [
            {
                value: "brazil",
                label: "Brazil",
                children: [city("Recife"), city("Rio")],
            },
            {
                value: "canada",
                label: "Canada",
                children: [city("Ottawa"), city("Toronto")],
            },
        ],
    },
    {
        value: "asia",
        label: "Asia",
        children: [
            {
                value: "japan",
                label: "Japan",
                children: [city("Osaka"), city("Tokyo")],
            },
        ],
    },
    {
        value: "europe",
        label: "Europe",
        children: [
            {
                value: "france",
                label: "France",
                children: [city("Lyon"), city("Paris")],
            },
            {
                value: "portugal",
                label: "Portugal",
                children: [city("Lisbon"), city("Porto")],
            },
        ],
    },
];

// A city chosen through its region and country: one listbox per open level, Right, Enter or a
// hover opens the next one, Left goes back (mirrored in RTL), typing jumps within a level, and
// Enter on a city chooses it. The Field shows an error when nothing is chosen, and the form
// submits the path of values (spec/cascade-select.md).
@Component({
    selector: "example-place-picker",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldDescription,
        FieldError,
        CascadeSelectRoot,
        CascadeSelectTrigger,
        CascadeSelectValue,
        CascadeSelectPortal,
        CascadeSelectPositioner,
        CascadeSelectPopup,
        CascadeSelectLevel,
        CascadeSelectItem,
        CascadeSelectItemIndicator,
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'city'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">City</label>
                <ng-container cascadeSelectRoot [items]="places" [required]="true">
                    <button cascadeSelectTrigger [class]="styles.trigger"><span cascadeSelectValue placeholder="Choose a city" [separator]="' / '" [class]="styles.value"></span></button>
                    <ng-container *cascadeSelectPortal>
                        <div cascadeSelectPositioner [class]="styles.positioner">
                            <div cascadeSelectPopup [class]="styles.popup">
                                @for (depth of depths; track depth) {
                                    <div cascadeSelectLevel [depth]="depth" #level="cascadeSelectLevel" [class]="styles.level">
                                        @for (item of level.items(); track item.value) {
                                            <div cascadeSelectItem [value]="item.value" [class]="styles.item">{{ item.label }}<span *cascadeSelectItemIndicator [class]="styles.itemIndicator">✓</span></div>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <p fieldDescription [class]="styles.field.description">Region, country, then city.</p>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Choose a city.</div>
            </div>
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class PlacePicker {
    protected readonly styles = styles;
    protected readonly places = PLACES;
    protected readonly depths = [0, 1, 2];
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(String(data.get("city")));
    }
}
