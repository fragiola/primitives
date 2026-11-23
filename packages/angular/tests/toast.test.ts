import { createToastManager } from "@fragiola/primitives-angular/toast";
import { describe, expect, it } from "vitest";

// spec/toast.md: the entry's createToastManager is the toolkit's queue, for a plain module
describe("@fragiola/primitives-angular/toast", () => {
    it("creates a queue a plain module can fill", () => {
        const manager = createToastManager({ limit: 1 });
        const first = manager.add({ title: "A", timeout: 0 });
        manager.add({ title: "B", timeout: 0 });
        expect(manager.toasts().map((toast) => toast.title)).toEqual([
            "B",
            "A",
        ]);
        expect(
            manager.toasts().find((toast) => toast.id === first)?.limited,
        ).toBe(true);
    });
});
