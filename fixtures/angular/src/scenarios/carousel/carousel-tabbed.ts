import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { Output } from "../../kit/output.ts";
import { CAROUSEL_PARTS } from "./carousel-parts.ts";

/** spec/carousel.md, `/carousel/tabbed` (and `?dir=rtl`). */
@Component({
    selector: "[scenario-carousel-tabbed]",
    encapsulation: ViewEncapsulation.None,
    imports: [CAROUSEL_PARTS, Output],
    template: `
        <div carouselRoot aria-label="Features" variant="tabbed" [slideCount]="slides.length" (pageChangeDetails)="report($event)" [class]="styles.root">
            <div carouselItemGroup [class]="styles.itemGroup">
                @for (slide of slides; track slide; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="slide + ' of ' + slides.length" [class]="styles.item"><div [class]="styles.slide">@for (run of ["Slide ", slide]; track $index) {<ng-container>{{ run }}</ng-container>}</div></div>
                }
            </div>
            <div carouselIndicatorGroup aria-label="Choose slide to display" [class]="styles.indicatorGroup">
                @for (slide of slides; track slide; let index = $index) {
                    <button carouselIndicator [index]="index" [attr.aria-label]="'Slide ' + slide" [class]="styles.indicator"></button>
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ page: page(), reason: reason() }"></pre>
    `,
})
export class CarouselTabbed {
    protected readonly styles = carousel;
    protected readonly slides = [1, 2, 3];
    protected readonly page = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.page.set(event.value);
        this.reason.set(event.details.reason);
    }
}
