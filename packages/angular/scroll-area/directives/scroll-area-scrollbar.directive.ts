import {
    computed,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import {
    conditionalView,
    dataValues,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import {
    ScrollAreaRoot,
    type ScrollAreaState,
    scrollAreaData,
} from "./scroll-area-root.directive.ts";

export interface ScrollAreaScrollbarState extends ScrollAreaState {
    /** A mouse or pen is over the Root. */
    hovering: boolean;
    orientation: ScrollAreaOrientation;
}

/** `*scrollAreaScrollbar`'s value: an orientation, or the options. */
export type ScrollAreaScrollbarOptions =
    | ScrollAreaOrientation
    | ""
    | undefined
    | { orientation?: ScrollAreaOrientation; keepMounted?: boolean };

const VERTICAL: Record<string, string> = {
    top: "0px",
    bottom: "var(--scroll-area-corner-height)",
    "inset-inline-end": "0px",
};

const HORIZONTAL: Record<string, string> = {
    "inset-inline-start": "0px",
    "inset-inline-end": "var(--scroll-area-corner-width)",
    bottom: "0px",
};

/**
 * The track of one axis (spec/scroll-area.md); structural, so it is rendered only while its axis
 * overflows (unless `keepMounted`): `<div *scrollAreaScrollbar="'horizontal'">` around its
 * `<div scrollAreaThumb>`. The directive writes its attributes and structural style on the element
 * it renders; a press on it and a drag of its Thumb scroll (the toolkit's listeners).
 */
@Directive({
    selector: "[scrollAreaScrollbar]",
    exportAs: "scrollAreaScrollbar",
})
export class ScrollAreaScrollbar {
    /** Its axis (default `vertical`), or `{ orientation, keepMounted }`. */
    readonly scrollAreaScrollbar = input<ScrollAreaScrollbarOptions>(undefined);
    private readonly root = inject(ScrollAreaRoot);
    private readonly options = computed<{
        orientation: ScrollAreaOrientation;
        keepMounted: boolean;
    }>(() => {
        const value = this.scrollAreaScrollbar();
        return typeof value === "object" && value !== null
            ? {
                  orientation: value.orientation ?? "vertical",
                  keepMounted: value.keepMounted ?? false,
              }
            : {
                  orientation:
                      value === "horizontal" ? "horizontal" : "vertical",
                  keepMounted: false,
              };
    });
    /** Its axis. */
    readonly orientation = computed<ScrollAreaOrientation>(
        () => this.options().orientation,
    );
    readonly state = computed<ScrollAreaScrollbarState>(() => {
        const measured = this.root.measured();
        const vertical = this.orientation() === "vertical";
        return {
            ...this.root.state(),
            scrolling: vertical ? measured.scrollingY : measured.scrollingX,
            hovering: measured.hovering,
            orientation: this.orientation(),
        };
    });

    constructor() {
        const root = this.root;
        const element = conditionalView(
            computed(() => {
                const measured = root.measured();
                return (
                    this.options().keepMounted ||
                    (this.orientation() === "vertical"
                        ? measured.hasOverflowY
                        : measured.hasOverflowX)
                );
            }),
            (bar) => {
                writeAttributes(bar, {
                    "aria-hidden": "true",
                    "data-primitives-part": "scroll-area-scrollbar",
                });
                bar.style.setProperty("position", "absolute");
                bar.style.setProperty("touch-action", "none");
                bar.style.setProperty("user-select", "none");
            },
        );
        // the element registers once per element it renders, never on a state change: a new
        // registration would end a running drag
        effect((onCleanup) => {
            const bar = element();
            const part =
                this.orientation() === "vertical"
                    ? "scrollbar-y"
                    : "scrollbar-x";
            if (bar === null) {
                return;
            }
            untracked(() => root.setPart(part, bar));
            onCleanup(() => root.setPart(part, null));
        });
        effect(() => {
            const bar = element();
            if (bar === null) {
                return;
            }
            const state = this.state();
            const vertical = state.orientation === "vertical";
            const placement = vertical ? VERTICAL : HORIZONTAL;
            for (const name of [
                "top",
                "bottom",
                "inset-inline-start",
                "inset-inline-end",
            ]) {
                const value = placement[name];
                if (value === undefined) {
                    bar.style.removeProperty(name);
                } else {
                    bar.style.setProperty(name, value);
                }
            }
            if (root.measured().measured) {
                bar.style.removeProperty("visibility");
            } else {
                bar.style.setProperty("visibility", "hidden");
            }
            const data = dataValues({
                hovering: state.hovering,
                scrolling: state.scrolling,
            });
            const overflow = scrollAreaData(state);
            writeAttributes(bar, {
                "data-orientation": state.orientation,
                "data-hovering": data.hovering,
                "data-scrolling": data.scrolling,
                "data-has-overflow-x": overflow["has-overflow-x"],
                "data-has-overflow-y": overflow["has-overflow-y"],
                "data-overflow-x-start": overflow["overflow-x-start"],
                "data-overflow-x-end": overflow["overflow-x-end"],
                "data-overflow-y-start": overflow["overflow-y-start"],
                "data-overflow-y-end": overflow["overflow-y-end"],
            });
        });
    }
}
