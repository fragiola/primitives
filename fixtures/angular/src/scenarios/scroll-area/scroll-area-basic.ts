import { Component, computed, signal, ViewEncapsulation } from "@angular/core";
import {
    ScrollAreaContent,
    ScrollAreaCorner,
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
} from "@fragiola/primitives-angular/scroll-area";
import { scrollArea } from "examples-shared/recipes/scroll-area";

/** The changelog's lines: release 1.40 first, each wider than the area. */
const RELEASES = Array.from({ length: 40 }, (_, index) => 40 - index);

/**
 * spec/scroll-area.md, `/scroll-area/basic` (and `?dir=rtl`). A line's text is three text nodes,
 * as JSX makes `Release 1.{release}: fixed ...`.
 */
@Component({
    selector: "[scenario-scroll-area-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        ScrollAreaRoot,
        ScrollAreaViewport,
        ScrollAreaContent,
        ScrollAreaScrollbar,
        ScrollAreaThumb,
        ScrollAreaCorner,
    ],
    template: `
        <div class="flex flex-col items-start gap-4">
            <div class="flex gap-2">
                <button type="button" (click)="few.set(!few())">Toggle items</button>
                <button type="button" (click)="wide.set(!wide())">Toggle width</button>
            </div>
            <div [class]="wide() ? 'h-48 w-[48rem]' : 'h-48 w-64'">
                <div scrollAreaRoot [class]="styles.root">
                    <div scrollAreaViewport role="region" aria-label="Changelog" [class]="styles.viewport">
                        <div scrollAreaContent [class]="styles.content">
                            @for (release of releases(); track release) {
                                <p class="whitespace-nowrap">@for (run of ["Release 1.", release, ": fixed the focus ring of nested menus and the scroll lock on touch"]; track $index) {<ng-container>{{ run }}</ng-container>}</p>
                            }
                        </div>
                    </div>
                    <div *scrollAreaScrollbar="'vertical'" [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
                    <div *scrollAreaScrollbar="'horizontal'" [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
                    <div *scrollAreaCorner [class]="styles.corner"></div>
                </div>
            </div>
            <div class="h-48 w-64">
                <div scrollAreaRoot [class]="styles.root">
                    <div scrollAreaViewport role="region" aria-label="Shortcuts" [class]="styles.viewport">
                        <div scrollAreaContent [class]="styles.content">
                            <p>Ctrl+K: search</p>
                            <p>Ctrl+P: print</p>
                            <p>Ctrl+S: save</p>
                        </div>
                    </div>
                    <div *scrollAreaScrollbar="'vertical'" [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
                    <div *scrollAreaScrollbar="'horizontal'" [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
                    <div *scrollAreaCorner [class]="styles.corner"></div>
                </div>
            </div>
        </div>
    `,
})
export class ScrollAreaBasic {
    protected readonly styles = scrollArea;
    protected readonly few = signal(false);
    protected readonly wide = signal(false);
    protected readonly releases = computed(() =>
        this.few() ? RELEASES.slice(0, 3) : RELEASES,
    );
}
