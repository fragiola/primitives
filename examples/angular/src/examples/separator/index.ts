import { Component } from "@angular/core";
import { Separator } from "@fragiola/primitives-angular/separator";
import { styles } from "./styles.ts";

// A profile card: a horizontal separator between its sections, vertical ones between its links,
// and a decorative one that assistive technologies skip (spec/separator.md).
@Component({
    selector: "example-profile-card",
    imports: [Separator],
    template: `
        <div [class]="styles.card">
            <p [class]="styles.heading">Ada Lovelace</p>
            <p [class]="styles.text">Analyst and metaphysician.</p>
            <div separator [class]="styles.root"></div>
            <div [class]="styles.row">
                <a href="#notes" [class]="styles.link">Notes</a>
                <div separator orientation="vertical" [class]="styles.root"></div>
                <a href="#letters" [class]="styles.link">Letters</a>
                <div separator orientation="vertical" [class]="styles.root"></div>
                <a href="#engine" [class]="styles.link">Engine</a>
            </div>
            <div separator decorative [class]="styles.root"></div>
        </div>
    `,
})
export default class ProfileCard {
    protected readonly styles = styles;
}
