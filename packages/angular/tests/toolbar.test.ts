import "@angular/compiler";
import {
    Component,
    Input,
    Output,
    provideZonelessChangeDetection,
    signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { Toggle } from "@fragiola/primitives-angular/toggle";
import { ToggleGroup } from "@fragiola/primitives-angular/toggle-group";
import {
    ToolbarButton,
    ToolbarGroup,
    ToolbarInput,
    ToolbarLink,
    ToolbarRoot,
} from "@fragiola/primitives-angular/toolbar";
import { afterEach, describe, expect, it } from "vitest";

// The directives compiled at run time (JIT). Their signal inputs and outputs are declared by
// Angular's compiler from the source, which this test does not run: they are declared here as
// that compiler's JIT transform declares them (`@Input({ isSignal: true })`, `@Output()`).
const declareSignalInput = Input as unknown as (options: {
    isSignal: true;
    alias: string;
    required: false;
}) => (target: object, key: string) => void;
const inputs: [object, string[]][] = [
    [ToolbarRoot.prototype, ["disabled"]],
    [ToolbarGroup.prototype, ["disabled"]],
    [ToolbarButton.prototype, ["disabled", "focusableWhenDisabled"]],
    [ToolbarInput.prototype, ["disabled", "focusableWhenDisabled"]],
    [Toggle.prototype, ["value", "pressed"]],
];
for (const [target, names] of inputs) {
    for (const name of names) {
        declareSignalInput({ isSignal: true, alias: name, required: false })(
            target,
            name,
        );
    }
}
Output("pressedChange")(Toggle.prototype, "pressedChange");
Output("valueChange")(ToggleGroup.prototype, "valueChange");

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
afterEach(() => TestBed.resetTestingModule());

async function render<T>(component: new () => T): Promise<HTMLElement> {
    TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.append(root);
    return root;
}

function button(root: HTMLElement, name: string): HTMLButtonElement {
    const found = [...root.querySelectorAll("button")].find(
        (element) => element.textContent === name,
    );
    if (found === undefined) {
        throw new Error(`no button ${name}`);
    }
    return found;
}

const keydown = (element: HTMLElement, key: string) =>
    element.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );

@Component({
    selector: "test-disabled-toolbar",
    imports: [
        ToolbarRoot,
        ToggleGroup,
        Toggle,
        ToolbarButton,
        ToolbarInput,
        ToolbarLink,
    ],
    template: `
        <div toolbarRoot aria-label="Formatting" [disabled]="true">
            <div toggleGroup aria-label="Text style">
                <button toggle [value]="'bold'">Bold</button>
            </div>
            <button toolbarButton>Undo</button>
            <input toolbarInput aria-label="Search">
            <a toolbarLink href="#help">Help</a>
        </div>
    `,
})
class DisabledToolbar {}

@Component({
    selector: "test-disabled-group",
    imports: [ToolbarRoot, ToolbarGroup, ToolbarButton, Toggle],
    template: `
        <div toolbarRoot aria-label="Formatting">
            <div toolbarGroup aria-label="History" [disabled]="true">
                <button toolbarButton>Undo</button>
                <button toggle>Snap</button>
            </div>
            <button toolbarButton>Share</button>
        </div>
    `,
})
class DisabledGroup {}

// spec/toolbar.md, "Nested composites" (5): a disabled scope disables the items inside it
describe("a disabled Toolbar and Toolbar.Group", () => {
    it("disable their buttons, inputs and a nested ToggleGroup's toggles; a link stays", async () => {
        const root = await render(DisabledToolbar);
        expect(button(root, "Bold").disabled).toBe(true);
        expect(
            root.querySelector<HTMLElement>('[role="group"]')?.dataset.disabled,
        ).toBe("");
        expect(button(root, "Undo").disabled).toBe(true);
        expect(root.querySelector("input")?.disabled).toBe(true);
        // the link holds the tab stop, the only item that can take focus
        expect(root.querySelector("a")?.getAttribute("tabindex")).toBe("0");
        root.remove();
    });

    it("a disabled Toolbar.Group disables its items only", async () => {
        const root = await render(DisabledGroup);
        expect(button(root, "Undo").disabled).toBe(true);
        expect(button(root, "Snap").disabled).toBe(true);
        expect(button(root, "Share").disabled).toBe(false);
        expect(button(root, "Share").getAttribute("tabindex")).toBe("0");
        root.remove();
    });
});

@Component({
    selector: "test-focusable-disabled",
    imports: [ToolbarRoot, ToolbarButton, ToolbarInput],
    template: `
        <div toolbarRoot aria-label="Formatting">
            <button toolbarButton [disabled]="true" [focusableWhenDisabled]="true" (click)="clicks.set(clicks() + 1)">Share</button>
            <input toolbarInput aria-label="Search" [disabled]="true" [focusableWhenDisabled]="true">
        </div>
    `,
})
class FocusableDisabled {
    readonly clicks = signal(0);
}

// spec/toolbar.md, "Disabled items"
describe("a focusable disabled Toolbar.Input and Toolbar.Button", () => {
    it("are aria-disabled, the input read-only, and the button lets the toolbar's keys through", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(FocusableDisabled);
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        document.body.append(root);
        const input = root.querySelector("input") as HTMLInputElement;
        expect(input.getAttribute("aria-disabled")).toBe("true");
        expect(input.readOnly).toBe(true);
        expect(input.disabled).toBe(false);
        const share = button(root, "Share");
        expect(share.getAttribute("tabindex")).toBe("0");
        // dispatchEvent is `false` when the default was prevented
        expect(keydown(share, "Enter")).toBe(false);
        share.click();
        expect(fixture.componentInstance.clicks()).toBe(0);
        share.focus();
        // the toolbar moves the focus: the disabled button did not prevent the arrow
        expect(keydown(share, "ArrowRight")).toBe(false);
        expect(document.activeElement).toBe(input);
        root.remove();
    });
});

@Component({
    selector: "test-toggle-in-group",
    imports: [ToggleGroup, Toggle],
    template: `
        <div toggleGroup aria-label="Alignment" (valueChange)="calls.push('group:' + $event.join())">
            <button toggle [value]="'left'" [pressed]="false" (pressedChange)="calls.push('left:' + $event)">Left</button>
        </div>
    `,
})
class ToggleInGroup {
    readonly calls: string[] = [];
}

// spec/toggle.md, "API": inside a group, the Toggle reports before the group's change
describe("a Toggle in a ToggleGroup", () => {
    it("reports its pressed state, then the group its value", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(ToggleInGroup);
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        button(root, "Left").click();
        await fixture.whenStable();
        expect(fixture.componentInstance.calls).toEqual([
            "left:true",
            "group:left",
        ]);
        // the group's value wins over the Toggle's own `pressed`
        expect(button(root, "Left").getAttribute("aria-pressed")).toBe("true");
    });
});
