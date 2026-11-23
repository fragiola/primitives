import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { Output } from "../../kit/output.ts";
import { CAROUSEL_PARTS } from "./carousel-parts.ts";

/** spec/carousel.md, `/carousel/multiple` */
@Component({
    selector: "[scenario-carousel-multiple]",
    encapsulation: ViewEncapsulation.None,
    imports: [CAROUSEL_PARTS, Output],
    template: `
        <div carouselRoot aria-label="Products" [slideCount]="slides.length" [slidesPerPage]="2" [slidesPerMove]="2" spacing="16px" (pageChangeDetails)="report($event)" [class]="styles.root">
            <div carouselItemGroup [class]="styles.itemGroup">
                @for (slide of slides; track slide; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="slide + ' of ' + slides.length" [class]="styles.item"><div [class]="styles.slide">{{ slide }}</div></div>
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
export class CarouselMultiple {
    protected readonly styles = carousel;
    protected readonly slides = [1, 2, 3, 4, 5];
    protected readonly page = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.page.set(event.value);
        this.reason.set(event.details.reason);
    }
}
