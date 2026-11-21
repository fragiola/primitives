// Adapted from Tree (fragiola/tree, examples/angular/src/embed/main.ts), same author and licence.
import { NgComponentOutlet } from "@angular/common";
import {
    afterNextRender,
    Component,
    DestroyRef,
    type ElementRef,
    ErrorHandler,
    Injector,
    inject,
    provideZonelessChangeDetection,
    signal,
    type Type,
    viewChild,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
    followTheme,
    postReady,
    reportHeight,
} from "examples-shared/embed/messages";
import { promoteOverlays } from "examples-shared/embed/overlay-promotion";
import { LOADERS } from "./loaders.generated.ts";
import "./styles.css";

// `?id=<id>` renders one example on the whole viewport, with no chrome: the site puts it in an
// iframe (contract v1.7, §5). The same protocol, markup and messages as examples/react's embed,
// with the same overlay promotion (examples-shared/embed/overlay-promotion).

const READY_TIMEOUT_MS = 500;

const id = new URLSearchParams(location.search).get("id");
const loader = id ? LOADERS[id] : undefined;

/** The error an example threw while rendering, shown in place of it. */
const failure = signal<string | undefined>(undefined);

/** An error of the example (rendering, a listener): logged, and shown in place of the example. */
class EmbedErrorHandler implements ErrorHandler {
    handleError(error: unknown): void {
        console.error(error);
        failure.set(error instanceof Error ? error.message : String(error));
    }
}

@Component({
    selector: "[data-embed-stage]",
    imports: [NgComponentOutlet],
    template: `
        @if (!known) {
            @if (id) {
                <div role="alert" class="m-4 self-start">Unknown example "{{ id }}"</div>
            } @else {
                <ul class="m-4 flex flex-col gap-1 self-start">
                    @for (slug of slugs; track slug) {
                        <li><a class="underline" [href]="'?id=' + slug">{{ slug }}</a></li>
                    }
                </ul>
            }
        } @else if (failure()) {
            <div role="alert" class="m-4 self-start">This example failed: {{ failure() }}</div>
        } @else if (example(); as component) {
            <div #content data-testid="example-root" class="flex min-h-0 min-w-0 flex-col p-6">
                <ng-container *ngComponentOutlet="component" />
            </div>
        }
    `,
})
class Embed {
    protected readonly id = id;
    protected readonly known = loader !== undefined;
    protected readonly slugs = Object.keys(LOADERS);
    protected readonly failure = failure;
    protected readonly example = signal<Type<unknown> | undefined>(undefined);
    private readonly content = viewChild<ElementRef<HTMLElement>>("content");
    private readonly injector = inject(Injector);
    private sent = false;

    constructor() {
        const destroyRef = inject(DestroyRef);
        if (!id) {
            return;
        }
        if (!loader) {
            this.ready();
            return;
        }
        loader
            .load()
            .then((module) => {
                this.example.set(module.default);
                // wait two frames after the example's first render, so the site shows the frame
                // painted; a frame the browser does not render gets no animation frames, so a
                // timeout sends it anyway
                afterNextRender(
                    () => {
                        let second = 0;
                        const first = requestAnimationFrame(() => {
                            second = requestAnimationFrame(() => this.ready());
                        });
                        const fallback = setTimeout(
                            () => this.ready(),
                            READY_TIMEOUT_MS,
                        );
                        destroyRef.onDestroy(() => {
                            cancelAnimationFrame(first);
                            cancelAnimationFrame(second);
                            clearTimeout(fallback);
                        });
                    },
                    { injector: this.injector },
                );
            })
            .catch((error: unknown) => {
                console.error(error);
                failure.set(
                    error instanceof Error ? error.message : String(error),
                );
                this.ready();
            });
    }

    /** Says `ready` once; a flow example also reports its height. */
    private ready() {
        if (this.sent || !id) return;
        this.sent = true;
        postReady(id);
        const content = this.content()?.nativeElement;
        if (loader?.layout === "flow" && content) reportHeight(id, content);
    }
}

const stage = document.getElementById("root");
if (stage) {
    if (loader?.layout === "flow") {
        // a flow example sizes the frame: the stage takes its content's height
        stage.style.height = "auto";
        stage.style.gridTemplate = "auto / minmax(0, 1fr)";
    }
    followTheme();
    if (id) promoteOverlays(id);
    bootstrapApplication(Embed, {
        providers: [
            provideZonelessChangeDetection(),
            { provide: ErrorHandler, useClass: EmbedErrorHandler },
        ],
    }).catch((error: unknown) => console.error(error));
}
