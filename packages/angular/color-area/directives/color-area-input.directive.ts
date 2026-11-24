import {
    computed,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import {
    colorAreaKeyTarget,
    formatColorChannel,
} from "@fragiola/primitives/color";
import { getDirection } from "@fragiola/primitives/direction";
import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
import {
    dataValues,
    injectFlush,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import {
    type ColorAreaAxis,
    ColorAreaRoot,
} from "./color-area-root.directive.ts";

/** The toolkit's visually hidden style, as a host style map (dash-case properties). */
const HIDDEN_STYLE: Record<string, string> = Object.fromEntries(
    Object.entries(VISUALLY_HIDDEN_INPUT_STYLE).map(([name, value]) => [
        name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        value,
    ]),
);

/**
 * One axis's `slider` (spec/color-area.md): the consumer's own native range input, visually
 * hidden in the Thumb: `<input colorAreaInput axis="x" name="saturation" aria-label="Saturation">`.
 * Every key moves the axis it names, and the focus follows it ("Keyboard").
 */
@Directive({
    selector: "input[colorAreaInput]",
    exportAs: "colorAreaInput",
    host: {
        type: "range",
        "data-primitives-part": "color-area-input",
        // the bounds before the value: a range input clamps its value to them
        "[attr.min]": "range().min",
        "[attr.max]": "range().max",
        "[attr.step]": "range().step",
        "[value]": "valueAttribute()",
        // the attribute follows the value, as React's controlled input: a server render writes
        // it, and a form reset restores the rendered value
        "[attr.value]": "valueAttribute()",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-orientation]": "axis() === 'x' ? 'horizontal' : 'vertical'",
        "[attr.tabindex]": "root.activeAxis() === axis() ? 0 : -1",
        "[attr.disabled]": "data().disabled",
        "[attr.data-axis]": "data().axis",
        "[attr.data-channel]": "data().channel",
        "[attr.data-disabled]": "data().disabled",
        // structural: visually hidden (its `pointer-events: none`)
        "[style]": "hiddenStyle",
        "(keydown)": "onKeyDown($event)",
        "(input)": "onInput()",
        "(focus)": "root.activeAxis.set(axis())",
    },
})
export class ColorAreaInput {
    /** The axis this slider is: `x` or `y`. */
    readonly axis = input.required<ColorAreaAxis>();
    protected readonly root = inject(ColorAreaRoot);
    readonly state = this.root.state;
    private readonly host = injectHost<HTMLInputElement>();
    private readonly flush = injectFlush();
    protected readonly hiddenStyle = HIDDEN_STYLE;
    private readonly channel = computed(() => {
        const { xChannel, yChannel } = this.root.channels();
        return this.axis() === "x" ? xChannel : yChannel;
    });
    protected readonly range = computed(() =>
        this.axis() === "x" ? this.root.xRange() : this.root.yRange(),
    );
    private readonly channelValue = computed(() =>
        this.axis() === "x" ? this.root.xValue() : this.root.yValue(),
    );
    protected readonly valueAttribute = computed(() =>
        String(this.channelValue()),
    );
    protected readonly valueText = computed(() =>
        formatColorChannel(
            this.root.color(),
            this.channel(),
            this.root.locale(),
            this.channelValue(),
        ),
    );
    protected readonly data = computed(() =>
        dataValues({
            axis: this.axis(),
            channel: this.channel(),
            disabled: this.root.isDisabled(),
        }),
    );

    constructor() {
        effect((onCleanup) => {
            const axis = this.axis();
            onCleanup(
                untracked(() => this.root.registerInput(axis, this.host)),
            );
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        if (root.isDisabled()) {
            return;
        }
        const target = colorAreaKeyTarget(event.key, event.shiftKey, {
            x: root.xValue(),
            y: root.yValue(),
            xRange: root.xRange(),
            yRange: root.yRange(),
            rtl: getDirection(this.host, root.providedDirection()) === "rtl",
        });
        if (target === null) {
            return;
        }
        // the native range keys never run
        event.preventDefault();
        root.commit(
            root.setValues({ [target.axis]: target.value }, "keyboard"),
        );
        if (target.axis !== this.axis()) {
            // the focus follows the axis the key moved
            root.inputs()[target.axis]?.focus();
        }
        // the new values and tab stop before the next key
        this.flush();
    }

    /** An assistive technology's own change of the slider. */
    protected onInput(): void {
        const root = this.root;
        root.commit(
            root.setValues(
                { [this.axis()]: Number(this.host.value) },
                "keyboard",
            ),
        );
        this.flush();
        // a value the consumer kept does not re-run the binding: put the state's back
        root.writeInputs();
    }
}
