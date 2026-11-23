import { Component, signal } from "@angular/core";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { styles } from "./styles.ts";

// A track's actions: three toggle buttons, each named by its text, which never changes with the
// state (`aria-pressed` tells it). "Favourite" is controlled, "Mute" starts pressed, "Download"
// is disabled; a click, Enter or Space presses and releases the focused one (spec/toggle.md).
@Component({
    selector: "example-track-actions",
    imports: [Toggle],
    template: `
        <div [class]="styles.card">
            <div>
                <p [class]="styles.title">Blue in Green</p>
                <p [class]="styles.subtitle">Miles Davis · Kind of Blue</p>
            </div>
            <div [class]="styles.actions">
                <button toggle [(pressed)]="favourite" [class]="styles.root"><span aria-hidden="true">♥</span>Favourite</button>
                <button toggle [defaultPressed]="true" [class]="styles.root">Mute</button>
                <button toggle [disabled]="true" [class]="styles.root">Download</button>
            </div>
            <p [class]="styles.status">{{ favourite() ? "In your favourites" : "Not in your favourites" }}</p>
        </div>
    `,
})
export default class TrackActions {
    protected readonly styles = styles;
    protected readonly favourite = signal(false);
}
