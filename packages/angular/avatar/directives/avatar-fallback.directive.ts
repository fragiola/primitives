import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    signal,
} from "@angular/core";
import {
    conditionalView,
    injectFlush,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { AvatarRoot } from "./avatar-root.directive.ts";

/**
 * Shown while the image is not loaded (spec/avatar.md); structural: `<span *avatarFallback>AL</span>`,
 * or `*avatarFallback="300"` to render it only once 300 ms have passed since it mounted, so a fast
 * image never flashes it. With a delay, a server renders none (the delay has not passed).
 */
@Directive({ selector: "[avatarFallback]", exportAs: "avatarFallback" })
export class AvatarFallback {
    /** Rendered only once this many milliseconds have passed since it mounted. */
    readonly delay = input<number | undefined, unknown>(undefined, {
        alias: "avatarFallback",
        // `*avatarFallback` alone gives "": no delay
        transform: (value: unknown) =>
            value === "" || value === null || value === undefined
                ? undefined
                : Number(value),
    });
    private readonly root = inject(AvatarRoot);
    readonly state = this.root.state;
    private readonly waiting = signal<boolean | null>(null);

    constructor() {
        const delayed = computed(
            () => this.waiting() ?? this.delay() !== undefined,
        );
        conditionalView(
            computed(() => !delayed() && this.root.status() !== "loaded"),
            (rendered) =>
                writeAttributes(rendered, {
                    "data-primitives-part": "avatar-fallback",
                }),
        );
        const flush = injectFlush();
        let timer: ReturnType<typeof setTimeout> | undefined;
        afterNextRender(() => {
            const delay = this.delay();
            if (delay === undefined) {
                this.waiting.set(false);
                return;
            }
            // rendered within the timer's task, as React and Vue render it (Angular's scheduler
            // would wait for a later task or frame)
            timer = setTimeout(() => {
                this.waiting.set(false);
                flush();
            }, delay);
        });
        inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    }
}
