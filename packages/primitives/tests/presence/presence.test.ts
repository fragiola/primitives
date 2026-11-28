import { describe, expect, it } from "vitest";
import { waitForAnimations } from "../../src/presence/presence.ts";

interface FakeAnimation {
    playState: AnimationPlayState;
    finished: Promise<unknown>;
    end: () => void;
    cancel: () => void;
}

function animation(): FakeAnimation {
    let resolve = () => {};
    let reject = (_reason: unknown) => {};
    const fake: FakeAnimation = {
        playState: "running",
        finished: new Promise<void>((done, fail) => {
            resolve = done;
            reject = fail;
        }),
        end: () => {
            fake.playState = "finished";
            resolve();
        },
        cancel: () => {
            fake.playState = "idle";
            reject(new DOMException("canceled", "AbortError"));
        },
    };
    return fake;
}

function element(animations: () => FakeAnimation[]): Element {
    const node = document.createElement("div");
    node.getAnimations = () => animations() as unknown as Animation[];
    return node;
}

const settled = (promise: Promise<void>) => {
    let done = false;
    void promise.then(() => {
        done = true;
    });
    return async () => {
        for (let round = 0; round < 10; round += 1) {
            await Promise.resolve();
        }
        return done;
    };
};

// spec/README.md, "Lifecycle" and spec/dialog.md, "Animation" (Epic #130)
describe("waitForAnimations", () => {
    it("resolves at once with nothing running, finished animations included", async () => {
        const ended = animation();
        ended.end();
        const isDone = settled(waitForAnimations(element(() => [ended])));
        expect(await isDone()).toBe(true);
    });

    it("resolves once every running animation finished", async () => {
        const first = animation();
        const second = animation();
        const isDone = settled(
            waitForAnimations(element(() => [first, second])),
        );
        first.end();
        expect(await isDone()).toBe(false);
        second.end();
        expect(await isDone()).toBe(true);
    });

    it("awaits an animation that replaced a canceled one", async () => {
        const canceled = animation();
        const replacement = animation();
        let current = [canceled];
        const isDone = settled(waitForAnimations(element(() => current)));
        current = [canceled, replacement];
        canceled.cancel();
        expect(await isDone()).toBe(false);
        replacement.end();
        expect(await isDone()).toBe(true);
    });
});
