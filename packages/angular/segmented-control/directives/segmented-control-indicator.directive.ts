import {
    afterRenderEffect,
    CSP_NONCE,
    computed,
    Directive,
    effect,
    inject,
    input,
    PLATFORM_ID,
    signal,
    untracked,
} from "@angular/core";
import {
    placeSegmentIndicator,
    type SegmentIndicatorBox,
    segmentIndicatorBox,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    conditionalView,
    dataAttributes,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import {
    type SegmentedControlOrientation,
    SegmentedControlRoot,
} from "./segmented-control-root.directive.ts";

/** Every variable the Indicator writes, removed while it is not measured. */
const VARIABLES = [
    "--segment-indicator-inset-inline-start",
    "--segment-indicator-inset-block-start",
    "--segment-indicator-inline-size",
    "--segment-indicator-block-size",
    "--segment-indicator-left",
    "--segment-indicator-right",
    "--segment-indicator-top",
    "--segment-indicator-bottom",
    "--segment-indicator-width",
    "--segment-indicator-height",
] as const satisfies readonly (keyof SegmentIndicatorBox)[];

export interface SegmentedControlIndicatorState {
    orientation: SegmentedControlOrientation;
    disabled: boolean;
}

/** The inline script of a server-rendered Indicator (`renderBeforeHydration`). */
const BEFORE_HYDRATION = `(${placeSegmentIndicator.toString()})(document.currentScript)`;

/**
 * Follows the checked Item through CSS variables measured from the Root's padding box
 * (spec/segmented-control.md): `<span *segmentedControlIndicator>` inside the Root, after the
 * Items. Structural: rendered once the checked Item is measured (at once with
 * `renderBeforeHydration`), never while no Item is checked, as in React and Vue; measured again on
 * a resize of the Root or of the Item and on a provider's direction change. The directive writes
 * its attributes on the element it renders. `*segmentedControlIndicator="true"` places it before
 * hydration in a server render, and `*segmentedControlIndicator="true; nonce: cspNonce"` gives its
 * script a nonce.
 */
@Directive({
    selector: "[segmentedControlIndicator]",
    exportAs: "segmentedControlIndicator",
})
export class SegmentedControlIndicator {
    private readonly root = inject(SegmentedControlRoot);
    /**
     * Places it before hydration in a server render (Base UI's name, as the Tabs Indicator): the
     * server writes a small inline script inside it that measures the checked Item as the page
     * parses, then removes itself (spec/segmented-control.md, "Server rendering").
     * `*segmentedControlIndicator="true"`; default `false`.
     */
    readonly renderBeforeHydration = input(false, {
        alias: "segmentedControlIndicator",
        // `*segmentedControlIndicator` alone gives "": not placed before hydration
        transform: (value: unknown) => value === true || value === "true",
    });
    /**
     * The `nonce` of the `renderBeforeHydration` script (a Content Security Policy's):
     * `*segmentedControlIndicator="true; nonce: cspNonce"`. Unset, Angular's own `CSP_NONCE`
     * provider.
     */
    readonly nonce = input<string | undefined>(undefined, {
        alias: "segmentedControlIndicatorNonce",
    });
    private readonly cspNonce = inject(CSP_NONCE, { optional: true });
    readonly state = computed<SegmentedControlIndicatorState>(() => ({
        orientation: this.root.orientation(),
        disabled: this.root.isDisabled(),
    }));

    /** The checked Item's box (the variables' values), once measured. */
    private readonly box = signal<SegmentIndicatorBox | null>(null);

    constructor() {
        const root = this.root;
        const box = this.box;
        const element = conditionalView(
            computed(
                () =>
                    root.checked() !== null &&
                    (box() !== null || this.renderBeforeHydration()),
            ),
            (rendered) =>
                writeAttributes(rendered, {
                    "aria-hidden": "true",
                    "data-primitives-part": "segmented-control-indicator",
                    ...dataAttributes({ ...untracked(this.state) }),
                }),
        );
        // only a server writes the script (an after render effect never runs there), which removes
        // itself before the browser hydrates
        if (inject(PLATFORM_ID) === "server") {
            effect(() => {
                const host = element();
                if (host !== null && this.renderBeforeHydration()) {
                    const nonce = this.nonce() ?? this.cspNonce;
                    untracked(() => {
                        const script =
                            host.ownerDocument.createElement("script");
                        if (nonce) {
                            script.setAttribute("nonce", nonce);
                        }
                        script.textContent = BEFORE_HYDRATION;
                        host.appendChild(script);
                    });
                }
            });
        }
        afterRenderEffect(() => {
            const host = element();
            const state = this.state();
            if (host !== null) {
                untracked(() =>
                    writeAttributes(host, dataAttributes({ ...state })),
                );
            }
        });
        // measured from the Root, so it is first rendered already placed (as React's and Vue's)
        afterRenderEffect((onCleanup) => {
            const item = root.checkedElement();
            const container = root.element;
            // a provider's direction re-measures
            root.providedDirection();
            untracked(() => {
                if (item === null) {
                    box.set(null);
                    return;
                }
                const measure = () =>
                    box.set(
                        segmentIndicatorBox(
                            container,
                            item,
                            getDirection(container) === "rtl",
                        ),
                    );
                measure();
                const view = container.ownerDocument.defaultView;
                const observer = view?.ResizeObserver
                    ? new view.ResizeObserver(measure)
                    : null;
                observer?.observe(container);
                observer?.observe(item);
                onCleanup(() => observer?.disconnect());
            });
        });
        afterRenderEffect(() => {
            const host = element();
            const values = box();
            if (host === null) {
                return;
            }
            VARIABLES.forEach((name) => {
                const value = values?.[name];
                if (value === undefined) {
                    host.style.removeProperty(name);
                } else {
                    host.style.setProperty(name, value);
                }
            });
        });
    }
}
