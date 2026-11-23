import { ElementRef, type OutputEmitterRef, signal } from "@angular/core";
import { describe, expect, it } from "vitest";
import { resolveFocusTarget } from "../internal/utils/change-details.ts";
import { controllable } from "../internal/utils/controllable.ts";
import {
    type HandleRoot,
    OverlayHandleStore,
} from "../internal/utils/overlay-handle.ts";
import { panelOptions } from "../internal/utils/panel-transition.ts";
import { portalOptions } from "../internal/utils/portal.ts";
import {
    dataAttributes,
    dataValue,
    dataValues,
} from "../internal/utils/state-attributes.ts";
import { reachableRows } from "../internal/utils/virtual-rows.ts";

describe("dataValue", () => {
    it("gives an empty attribute for true, none (null) for false, and strings as values", () => {
        expect(dataValue(true)).toBe("");
        expect(dataValue(false)).toBeNull();
        expect(dataValue(undefined)).toBeNull();
        expect(dataValue("end")).toBe("end");
        expect(
            dataValues({ open: true, disabled: false, side: "top" }),
        ).toEqual({ open: "", disabled: null, side: "top" });
    });
});

describe("dataAttributes", () => {
    it("prefixes the values for a part a structural directive renders", () => {
        expect(
            dataAttributes({
                open: true,
                closed: false,
                "activation-direction": "left",
            }),
        ).toEqual({
            "data-open": "",
            "data-closed": null,
            "data-activation-direction": "left",
        });
    });
});

describe("panelOptions", () => {
    it("reads `*xPanel` alone as no option, and an object as the options", () => {
        expect(panelOptions("")).toEqual({});
        expect(panelOptions(undefined)).toEqual({});
        expect(panelOptions({ hiddenUntilFound: true })).toEqual({
            hiddenUntilFound: true,
        });
    });
});

describe("resolveFocusTarget", () => {
    it("takes an element, an ElementRef, a getter or false", () => {
        const element = document.createElement("button");
        expect(resolveFocusTarget(element)).toBe(element);
        expect(resolveFocusTarget(new ElementRef(element))).toBe(element);
        expect(resolveFocusTarget(() => element)).toBe(element);
        expect(resolveFocusTarget(false)).toBe(false);
        expect(resolveFocusTarget(undefined)).toBeNull();
    });
});

describe("portalOptions", () => {
    it("reads `*xPortal` alone as no option, an element as the container", () => {
        const element = document.createElement("div");
        expect(portalOptions("")).toEqual({});
        expect(portalOptions(element)).toEqual({ container: element });
        expect(portalOptions({ keepMounted: true })).toEqual({
            keepMounted: true,
        });
    });
});

describe("controllable", () => {
    const emitter = (log: boolean[]) =>
        ({
            emit: (value: boolean) => log.push(value),
        }) as unknown as OutputEmitterRef<boolean>;

    it("only reports a change while bound, and follows the binding", () => {
        const bound = signal<boolean | undefined>(false);
        const emitted: boolean[] = [];
        const state = controllable(
            bound,
            emitter(emitted),
            () => false,
            () => {},
        );
        state.set(true, null);
        expect(emitted).toEqual([true]);
        expect(state.value()).toBe(false); // the consumer did not accept it
        bound.set(true);
        expect(state.value()).toBe(true);
    });

    it("keeps its own value when unbound, seeded once by the default", () => {
        const bound = signal<boolean | undefined>(undefined);
        const fallback = signal(true);
        const emitted: boolean[] = [];
        const state = controllable(
            bound,
            emitter(emitted),
            () => fallback(),
            () => {},
        );
        expect(state.value()).toBe(true);
        fallback.set(false);
        expect(state.value()).toBe(true);
        state.set(false, null);
        expect(state.value()).toBe(false);
        expect(emitted).toEqual([false]);
    });
});

describe("OverlayHandleStore", () => {
    /** A root directive's overlay, enough for the handle: its open state and entry points. */
    function fakeRoot(name: string, calls: string[]) {
        const open = signal(false);
        return {
            overlay: {
                open,
                openFromHandle: (id: string | null) => {
                    calls.push(`${name} open ${id}`);
                    open.set(true);
                },
                openWithPayload: () => calls.push(`${name} payload`),
                closeFromHandle: () => {
                    calls.push(`${name} close`);
                    open.set(false);
                },
            },
        } as unknown as HandleRoot;
    }

    it("serves the newest attached root, and gives the handle back on detach", () => {
        const calls: string[] = [];
        const store = new OverlayHandleStore("dialog");
        const first = fakeRoot("first", calls);
        const second = fakeRoot("second", calls);
        // no root: ignored
        store.open(null);
        expect(store.isOpen).toBe(false);
        store.attach(first);
        store.attach(second);
        expect(store.root()).toBe(second);
        store.open("a");
        expect(calls).toEqual(["second open a"]);
        // detaching the newest gives the handle back to the previous one
        store.detach(second);
        expect(store.root()).toBe(first);
        store.close();
        expect(calls).toEqual(["second open a", "first close"]);
        // detaching an older root keeps the newest one serving
        store.attach(second);
        store.detach(first);
        expect(store.root()).toBe(second);
        store.detach(second);
        expect(store.root()).toBeNull();
        store.detach(second);
        expect(store.root()).toBeNull();
    });
});

describe("reachableRows", () => {
    it("pins the ends, the highlighted row with its neighbours and the selected row", () => {
        expect(reachableRows(100, undefined, -1)).toEqual([0, 99]);
        expect(reachableRows(100, 50, 7)).toEqual([0, 99, 49, 50, 51, 7]);
    });
});
