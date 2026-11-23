import "@angular/compiler";
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { afterEach, describe, expect, it } from "vitest";
import { writeThumbLabelledBy } from "../slider/utils/write-labelled-by.ts";

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
afterEach(() => TestBed.resetTestingModule());

/** Runs the effects, after the observer's records of the last writes. */
async function settle(): Promise<void> {
    await Promise.resolve();
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
}

// spec/slider.md, "API": a Thumb's bound name. Epic #49 review: after a hydration the
// server-written `aria-labelledby` is the thumb's own, not the consumer's
describe("writeThumbLabelledBy", () => {
    it("takes a server-written aria-labelledby equal to its namer's id as its own", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const host = document.createElement("span");
        // the server render wrote the Label's id
        host.setAttribute("aria-labelledby", "label-1");
        document.body.append(host);
        const namer = signal<string | null>("label-1");
        TestBed.runInInjectionContext(() =>
            writeThumbLabelledBy(host, [namer]),
        );
        await settle();
        expect(host.getAttribute("aria-labelledby")).toBe("label-1");

        namer.set("label-2");
        await settle();
        expect(host.getAttribute("aria-labelledby")).toBe("label-2");
        namer.set(null);
        await settle();
        expect(host.hasAttribute("aria-labelledby")).toBe(false);
        host.remove();
    });

    it("leaves a consumer's own aria-labelledby", async () => {
        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection()],
        });
        const host = document.createElement("span");
        host.setAttribute("aria-labelledby", "mine");
        document.body.append(host);
        const namer = signal<string | null>("label-1");
        TestBed.runInInjectionContext(() =>
            writeThumbLabelledBy(host, [namer]),
        );
        await settle();
        expect(host.getAttribute("aria-labelledby")).toBe("mine");
        namer.set(null);
        await settle();
        expect(host.getAttribute("aria-labelledby")).toBe("mine");
        host.remove();
    });
});
