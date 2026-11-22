import { Component } from "@angular/core";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { styles } from "./styles.ts";

// Quick settings: three switches, each named by its label; Space and Enter toggle the focused one,
// "Airplane mode" is disabled (spec/switch.md).
@Component({
    selector: "example-quick-settings",
    imports: [SwitchRoot, SwitchThumb],
    template: `
        <div [class]="styles.list">
            <div [class]="styles.row">
                <button switchRoot id="wifi" defaultChecked [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>
                <label for="wifi">Wi-Fi</label>
            </div>
            <div [class]="styles.row">
                <button switchRoot id="bluetooth" [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>
                <label for="bluetooth">Bluetooth</label>
            </div>
            <div [class]="styles.row">
                <button switchRoot id="airplane" disabled [class]="styles.root"><span switchThumb [class]="styles.thumb"></span></button>
                <label for="airplane">Airplane mode</label>
            </div>
        </div>
    `,
})
export default class QuickSettings {
    protected readonly styles = styles;
}
