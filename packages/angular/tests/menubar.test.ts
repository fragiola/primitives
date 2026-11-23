import "@angular/compiler";
import {
    Component,
    Input,
    provideZonelessChangeDetection,
    signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { MenuRoot, MenuTrigger } from "@fragiola/primitives-angular/menu";
import { Menubar } from "@fragiola/primitives-angular/menubar";
import {
    ToolbarButton,
    ToolbarRoot,
} from "@fragiola/primitives-angular/toolbar";
import { afterEach, describe, expect, it } from "vitest";

// The directives compiled at run time (JIT): their signal inputs are declared here as Angular's
// compiler's JIT transform declares them (as tests/toolbar.test.ts does).
const declareSignalInput = Input as unknown as (options: {
    isSignal: true;
    alias: string;
    required: false;
}) => (target: object, key: string) => void;
for (const target of [MenuTrigger.prototype, Menubar.prototype]) {
    declareSignalInput({ isSignal: true, alias: "disabled", required: false })(
        target,
        "disabled",
    );
}

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

@Component({
    selector: "test-plain-triggers",
    imports: [MenuRoot, MenuTrigger, ToolbarRoot, ToolbarButton],
    template: `
        <ng-container menuRoot>
            <button menuTrigger [disabled]="true">Alone</button>
        </ng-container>
        <div toolbarRoot aria-label="Formatting">
            <button toolbarButton>Bold</button>
            <ng-container menuRoot>
                <button menuTrigger>More</button>
            </ng-container>
        </div>
    `,
})
class PlainTriggers {}

@Component({
    selector: "test-disabled-bar",
    imports: [Menubar, MenuRoot, MenuTrigger],
    template: `
        <div menubar aria-label="Application" [disabled]="true">
            <ng-container menuRoot><button menuTrigger>File</button></ng-container>
            <ng-container menuRoot><button menuTrigger>Edit</button></ng-container>
        </div>
    `,
})
class DisabledBar {}

@Component({
    selector: "test-inner-menu",
    imports: [Menubar, MenuRoot, MenuTrigger],
    template: `
        <div menubar aria-label="Application">
            <ng-container menuRoot>
                <button menuTrigger>File</button>
                <ng-container menuRoot><button menuTrigger>Inner</button></ng-container>
            </ng-container>
        </div>
    `,
})
class InnerMenu {}

@Component({
    selector: "test-bound-trigger",
    imports: [MenuRoot, MenuTrigger],
    template: `
        <ng-container menuRoot>
            <button
                menuTrigger
                [attr.role]="role()"
                [attr.tabindex]="tabIndex()"
                [attr.aria-disabled]="ariaDisabled()"
            >Bound</button>
        </ng-container>
    `,
})
class BoundTrigger {
    readonly role = signal<string | null>("button");
    readonly tabIndex = signal<string | null>("3");
    readonly ariaDisabled = signal<string | null>("true");
}

// spec/menu.md, "In a Menubar": the contract of a parent bar reaches the bar's own menus only
describe("a [menuTrigger] and its bar", () => {
    it("outside a bar, and in a Toolbar, is a plain menu button that joins no roving scope", async () => {
        const root = await render(PlainTriggers);
        const alone = button(root, "Alone");
        expect(alone.disabled).toBe(true);
        expect(alone.getAttribute("role")).toBeNull();
        expect(button(root, "More").getAttribute("tabindex")).toBeNull();
        expect(button(root, "Bold").getAttribute("tabindex")).toBe("0");
        root.remove();
    });

    it("in a disabled bar, is a focusable disabled item; the first holds the tab stop", async () => {
        const root = await render(DisabledBar);
        const bar = root.querySelector<HTMLElement>('[role="menubar"]');
        expect(bar?.dataset.disabled).toBe("");
        const file = button(root, "File");
        const edit = button(root, "Edit");
        expect(file.getAttribute("role")).toBe("menuitem");
        expect(file.disabled).toBe(false);
        expect(file.getAttribute("aria-disabled")).toBe("true");
        expect(file.getAttribute("tabindex")).toBe("0");
        expect(edit.getAttribute("tabindex")).toBe("-1");
        root.remove();
    });

    it("a Menu inside a bar's menu is no menu of the bar", async () => {
        const root = await render(InnerMenu);
        const inner = button(root, "Inner");
        expect(inner.getAttribute("role")).toBeNull();
        expect(inner.getAttribute("tabindex")).toBeNull();
        expect(button(root, "File").getAttribute("role")).toBe("menuitem");
        root.remove();
    });

    // Epic #49 review: outside a bar, the Trigger binds no role, tabindex or aria-disabled of
    // its own, so a consumer's bindings are the only ones
    it("outside a bar, leaves a consumer's bound role, tabindex and aria-disabled alone", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const fixture = TestBed.createComponent(BoundTrigger);
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        document.body.append(root);
        const bound = button(root, "Bound");
        expect(bound.getAttribute("role")).toBe("button");
        expect(bound.getAttribute("tabindex")).toBe("3");
        expect(bound.getAttribute("aria-disabled")).toBe("true");
        fixture.componentInstance.role.set("link");
        fixture.componentInstance.tabIndex.set("-1");
        fixture.componentInstance.ariaDisabled.set(null);
        await fixture.whenStable();
        expect(bound.getAttribute("role")).toBe("link");
        expect(bound.getAttribute("tabindex")).toBe("-1");
        expect(bound.hasAttribute("aria-disabled")).toBe(false);
        root.remove();
    });
});
