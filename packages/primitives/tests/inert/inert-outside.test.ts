import { describe, expect, it } from "vitest";
import { inertOutside } from "../../src/inert/inert-outside.ts";

describe("inertOutside", () => {
    it("makes the siblings of the kept element's ancestors inert, and restores them", () => {
        document.body.innerHTML = `
            <main id="main"><button id="outside">x</button></main>
            <div id="portal"><div id="dialog"></div></div>`;
        const dialog = document.getElementById("dialog") as HTMLElement;
        const restore = inertOutside([dialog]);
        expect(document.getElementById("main")?.hasAttribute("inert")).toBe(
            true,
        );
        expect(document.getElementById("portal")?.hasAttribute("inert")).toBe(
            false,
        );
        expect(dialog.hasAttribute("inert")).toBe(false);
        restore();
        expect(document.getElementById("main")?.hasAttribute("inert")).toBe(
            false,
        );
    });

    it("leaves a hidden kept-mounted overlay part alone, so it opens usable", () => {
        document.body.innerHTML = `
            <main id="main"></main>
            <div id="dialog" data-primitives-part="dialog-popup"></div>
            <div id="kept" data-primitives-part="popover-positioner" hidden></div>
            <div id="plain" hidden></div>`;
        const byId = (id: string) => document.getElementById(id) as HTMLElement;
        const restore = inertOutside([byId("dialog")]);
        expect(byId("main").hasAttribute("inert")).toBe(true);
        expect(byId("kept").hasAttribute("inert")).toBe(false);
        // a hidden element that is no overlay part stays outside the dialog
        expect(byId("plain").hasAttribute("inert")).toBe(true);
        // the popover opens from the dialog: it is shown, and takes focus and presses
        byId("kept").hidden = false;
        expect(byId("kept").closest("[inert]")).toBeNull();
        restore();
        expect(byId("main").hasAttribute("inert")).toBe(false);
        expect(byId("plain").hasAttribute("inert")).toBe(false);
    });

    it("lets a kept-mounted nested dialog open inside a dialog, and restores both levels", () => {
        document.body.innerHTML = `
            <main id="main"></main>
            <div id="outer" data-primitives-part="dialog-popup"></div>
            <div id="inner-backdrop" data-primitives-part="dialog-backdrop" hidden></div>
            <div id="inner" data-primitives-part="dialog-popup" hidden></div>`;
        const byId = (id: string) => document.getElementById(id) as HTMLElement;
        const restoreOuter = inertOutside([byId("outer")]);
        expect(byId("inner").hasAttribute("inert")).toBe(false);
        expect(byId("inner-backdrop").hasAttribute("inert")).toBe(false);
        byId("inner").hidden = false;
        byId("inner-backdrop").hidden = false;
        const restoreInner = inertOutside([
            byId("inner"),
            byId("inner-backdrop"),
        ]);
        expect(byId("outer").hasAttribute("inert")).toBe(true);
        expect(byId("main").hasAttribute("inert")).toBe(true);
        expect(byId("inner").hasAttribute("inert")).toBe(false);
        restoreInner();
        expect(byId("outer").hasAttribute("inert")).toBe(false);
        // the outer dialog's own inert stays until it closes
        expect(byId("main").hasAttribute("inert")).toBe(true);
        byId("inner").hidden = true;
        byId("inner-backdrop").hidden = true;
        restoreOuter();
        expect(byId("main").hasAttribute("inert")).toBe(false);
        expect(document.querySelectorAll("[inert]")).toHaveLength(0);
    });
});
