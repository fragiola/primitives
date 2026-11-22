import { ElementRef, type OutputEmitterRef, signal } from "@angular/core";
import { describe, expect, it } from "vitest";
import { resolveFocusTarget } from "../internal/utils/change-details.ts";
import { controllable } from "../internal/utils/controllable.ts";
import { panelOptions } from "../internal/utils/panel-transition.ts";
import { portalOptions } from "../internal/utils/portal.ts";
import {
    dataAttributes,
    dataValue,
    dataValues,
} from "../internal/utils/state-attributes.ts";

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
