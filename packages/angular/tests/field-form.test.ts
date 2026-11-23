import "@angular/compiler";
import {
    Component,
    Input,
    provideZonelessChangeDetection,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { CheckboxRoot } from "@fragiola/primitives-angular/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-angular/checkbox-group";
import {
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { afterEach, describe, expect, it } from "vitest";

// The directives compiled at run time (JIT). Their signal inputs are declared by Angular's
// compiler from the source, which this test does not run: they are declared here as that
// compiler's JIT transform declares them, `@Input({ isSignal: true })`.
const declareSignalInput = Input as unknown as (options: {
    isSignal: true;
    alias: string;
    required: false;
}) => (target: object, key: string) => void;
for (const name of ["name", "validate"]) {
    declareSignalInput({ isSignal: true, alias: name, required: false })(
        FieldRoot.prototype,
        name,
    );
}

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
afterEach(() => TestBed.resetTestingModule());

@Component({
    selector: "test-toppings",
    imports: [FieldRoot, FieldLabel, FieldError, CheckboxGroup, CheckboxRoot],
    template: `
        <form>
            <div fieldRoot name="toppings" [validate]="validate">
                <label fieldLabel>Toppings</label>
                <div checkboxGroup>
                    <button checkboxRoot value="cheese"></button>
                    <button checkboxRoot value="ham"></button>
                </div>
                <div *fieldError></div>
            </div>
        </form>
    `,
})
class Toppings {
    protected readonly validate = (value: unknown) =>
        Array.isArray(value) && value.length === 0 ? "Choose a topping." : null;
}

// spec/field.md, "When the result is shown": a control with no validated element of its own (a
// CheckboxGroup) in a native form validates on the form's submission attempt (Epic #26; its
// Angular test, Epic #49)
describe("a CheckboxGroup in a Field, in a native form", () => {
    it("validates on the form's submission", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(Toppings);
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        expect(root.textContent).not.toContain("Choose a topping.");
        const form = root.querySelector("form") as HTMLFormElement;
        form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
        );
        await fixture.whenStable();
        expect(root.textContent).toContain("Choose a topping.");
        expect(
            root.querySelector('[role="group"]')?.getAttribute("aria-invalid"),
        ).toBe("true");
    });
});
