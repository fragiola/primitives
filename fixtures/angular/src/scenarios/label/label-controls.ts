import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CheckboxIndicator,
    CheckboxRoot,
} from "@fragiola/primitives-angular/checkbox";
import { Label } from "@fragiola/primitives-angular/label";
import {
    NumberFieldGroup,
    NumberFieldInput,
    NumberFieldRoot,
} from "@fragiola/primitives-angular/number-field";
import {
    SliderControl,
    SliderIndicator,
    SliderRoot,
    SliderThumb,
    SliderTrack,
} from "@fragiola/primitives-angular/slider";
import { SwitchRoot, SwitchThumb } from "@fragiola/primitives-angular/switch";
import { checkbox } from "examples-shared/recipes/checkbox";
import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";
import { slider } from "examples-shared/recipes/slider";
import { switchControl } from "examples-shared/recipes/switch";
import { Output } from "../../kit/output.ts";

/**
 * A Label for each kind of control, none inside a Field (spec/label.md, `/label/controls`). The
 * wrapped Checkbox's label text is one text node after it, as in React.
 */
@Component({
    selector: "[scenario-label-controls]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        Label,
        CheckboxRoot,
        CheckboxIndicator,
        SwitchRoot,
        SwitchThumb,
        NumberFieldRoot,
        NumberFieldGroup,
        NumberFieldInput,
        SliderRoot,
        SliderControl,
        SliderTrack,
        SliderIndicator,
        SliderThumb,
        Output,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div class="flex items-center gap-2">
                <label label for="email" [class]="styles.root">Email</label>
                <input id="email" type="text" class="rounded-md border px-2" />
            </div>
            <label label [class]="styles.root"><button checkboxRoot #subscribeBox="checkboxRoot" (checkedChange)="subscribe.set($event)" [class]="checkboxStyles.root"><span *checkboxIndicator [class]="checkboxStyles.indicator">{{ subscribeBox.state().indeterminate ? "–" : "✓" }}</span></button>Subscribe</label>
            <div class="flex items-center gap-2">
                <label label for="notifications" [class]="styles.root">Notifications</label>
                <button switchRoot [id]="'notifications'" (checkedChange)="notifications.set($event)" [class]="switchStyles.root"><span switchThumb [class]="switchStyles.thumb"></span></button>
            </div>
            <div class="flex items-center gap-2">
                <label label for="quantity" [class]="styles.root">Quantity</label>
                <div numberFieldRoot [id]="'quantity'" [defaultValue]="1" [locale]="'en-US'" [class]="numberFieldStyles.root">
                    <div numberFieldGroup [class]="numberFieldStyles.group"><input numberFieldInput [class]="numberFieldStyles.input" /></div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <label label id="volume-label" for="volume" [class]="styles.root">Volume</label>
                <div sliderRoot [defaultValue]="40" [class]="sliderStyles.root">
                    <div sliderControl [class]="sliderStyles.control"><div sliderTrack [class]="sliderStyles.track"><div sliderIndicator [class]="sliderStyles.indicator"></div></div><div sliderThumb [id]="'volume'" aria-labelledby="volume-label" [class]="sliderStyles.thumb"></div></div>
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ subscribe: subscribe(), notifications: notifications() }"></pre>
    `,
})
export class LabelControls {
    protected readonly styles = label;
    protected readonly checkboxStyles = checkbox;
    protected readonly switchStyles = switchControl;
    protected readonly numberFieldStyles = numberField;
    protected readonly sliderStyles = slider;
    protected readonly subscribe = signal<boolean | undefined>(undefined);
    protected readonly notifications = signal<boolean | undefined>(undefined);
}
