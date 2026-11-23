import { Component, ViewEncapsulation } from "@angular/core";
import {
    ScrollAreaContent,
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
} from "@fragiola/primitives-angular/scroll-area";
import { scrollArea } from "examples-shared/recipes/scroll-area";

const CHAPTERS = Array.from({ length: 20 }, (_, index) => index + 1);

/**
 * spec/scroll-area.md, `/scroll-area/links`. A link's text is two text nodes, as JSX makes
 * `Chapter {chapter}`.
 */
@Component({
    selector: "[scenario-scroll-area-links]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ScrollAreaRoot,
        ScrollAreaViewport,
        ScrollAreaContent,
        ScrollAreaScrollbar,
        ScrollAreaThumb,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div class="h-48 w-64">
                <div scrollAreaRoot [class]="styles.root">
                    <div scrollAreaViewport role="region" aria-label="Chapters" [class]="styles.viewport">
                        <div scrollAreaContent [class]="styles.content">
                            @for (chapter of chapters; track chapter) {
                                <a [href]="'#chapter-' + chapter">@for (run of ["Chapter ", chapter]; track $index) {<ng-container>{{ run }}</ng-container>}</a>
                            }
                        </div>
                    </div>
                    <div *scrollAreaScrollbar="'vertical'" [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
                </div>
            </div>
            <button type="button">After</button>
        </div>
    `,
})
export class ScrollAreaLinks {
    protected readonly styles = scrollArea;
    protected readonly chapters = CHAPTERS;
}
