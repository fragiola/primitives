import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { Output } from "../../kit/output.ts";
import { CAROUSEL_PARTS } from "./carousel-parts.ts";

/** spec/carousel.md, `/carousel/vertical` */
@Component({
    selector: "[scenario-carousel-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [CAROUSEL_PARTS, Output],
    template: `
        <div carouselRoot aria-label="Stories" orientation="vertical" [slideCount]="slides.length" loop (pageChangeDetails)="report($event)" [class]="styles.root">
            <div carouselItemGroup [class]="groupClass">
                @for (slide of slides; track slide; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="slide + ' of ' + slides.length" [class]="styles.item"><div [class]="styles.verticalSlide">@for (run of ["Slide ", slide]; track $index) {<ng-container>{{ run }}</ng-container>}</div></div>
                }
            </div>
            <div [class]="styles.controls">
                <button carouselPrevTrigger aria-label="Previous slide" [class]="styles.control">‹</button>
                <button carouselNextTrigger aria-label="Next slide" [class]="styles.control">›</button>
            </div>
        </div>
        <pre fixtureOutput [values]="{ page: page(), reason: reason() }"></pre>
    `,
})
export class CarouselVertical {
    protected readonly styles = carousel;
    protected readonly groupClass =
        `${carousel.itemGroup} ${carousel.vertical}`;
    protected readonly slides = [1, 2, 3];
    protected readonly page = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.page.set(event.value);
        this.reason.set(event.details.reason);
    }
}
