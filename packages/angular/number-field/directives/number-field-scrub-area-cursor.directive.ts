import {
    computed,
    DestroyRef,
    Directive,
    DOCUMENT,
    effect,
    inject,
    untracked,
} from "@angular/core";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { NumberFieldRoot } from "./number-field-root.directive.ts";

/**
 * The virtual cursor of a locked scrub (spec/number-field.md, "Pointer"): structural,
 * `<span *numberFieldScrubAreaCursor>` inside the ScrubArea, rendered only while a mouse scrubs
 * with the pointer locked, its element moved to the document's `body` (React's portal). The
 * directive writes its attributes and its structural style on the element it renders. A server
 * renders none (no scrub runs there).
 */
@Directive({
    selector: "[numberFieldScrubAreaCursor]",
    exportAs: "numberFieldScrubAreaCursor",
})
export class NumberFieldScrubAreaCursor {
    private readonly root = inject(NumberFieldRoot);
    readonly state = this.root.state;

    constructor() {
        const root = this.root;
        const body = inject(DOCUMENT).body;
        // Angular removes a view's nodes wherever they are when it clears the view
        const element = conditionalView(
            computed(() => root.cursor() !== null),
            (rendered) => body.appendChild(rendered),
        );
        effect(() => {
            const rendered = element();
            const cursor = root.cursor();
            const data = root.data();
            if (rendered === null || cursor === null) {
                return;
            }
            untracked(() => {
                writeAttributes(rendered, {
                    "data-primitives-part": "number-field-scrub-area-cursor",
                    ...Object.fromEntries(
                        Object.entries(data).map(([key, value]) => [
                            `data-${key}`,
                            value,
                        ]),
                    ),
                });
                Object.assign(rendered.style, {
                    position: "fixed",
                    top: "0",
                    left: "0",
                    pointerEvents: "none",
                    transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
                });
            });
        });
        // destroyed with an enclosing view, Angular detaches only the view's own place: the node
        // moved to the body goes too
        inject(DestroyRef).onDestroy(() => untracked(element)?.remove());
    }
}
