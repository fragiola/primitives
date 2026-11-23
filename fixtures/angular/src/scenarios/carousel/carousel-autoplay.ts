import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { Output } from "../../kit/output.ts";
import { CAROUSEL_PARTS } from "./carousel-parts.ts";

/** spec/carousel.md, `/carousel/autoplay`: the AutoplayTrigger's label from its `state()`. */
@Component({
    selector: "[scenario-carousel-autoplay]",
    encapsulation: ViewEncapsulation.None,
    imports: [CAROUSEL_PARTS, Output],
    template: `
        <div carouselRoot aria-label="Highlights" [slideCount]="slides.length" defaultPlaying [delay]="3000" (pageChangeDetails)="report($event)" (playingChangeDetails)="reportPlaying($event)" [class]="styles.root">
            <div [class]="styles.controls">
                <button carouselAutoplayTrigger #rotation="carouselAutoplayTrigger" [class]="styles.control">{{ rotation.state().playing ? "Stop slide rotation" : "Start slide rotation" }}</button>
                <button carouselPrevTrigger aria-label="Previous slide" [class]="styles.control">‹</button>
                <button carouselNextTrigger aria-label="Next slide" [class]="styles.control">›</button>
            </div>
            <div carouselItemGroup [class]="styles.itemGroup">
                @for (slide of slides; track slide; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="slide + ' of ' + slides.length" [class]="styles.item"><div [class]="styles.slide">@for (run of ["Slide ", slide]; track $index) {<ng-container>{{ run }}</ng-container>}</div></div>
                }
            </div>
        </div>
        <pre fixtureOutput [values]="{ page: page(), reason: reason(), playing: playing(), playingReason: playingReason() }"></pre>
    `,
})
export class CarouselAutoplay {
    protected readonly styles = carousel;
    protected readonly slides = [1, 2, 3];
    protected readonly page = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly playing = signal<boolean | undefined>(undefined);
    protected readonly playingReason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.page.set(event.value);
        this.reason.set(event.details.reason);
    }
    protected reportPlaying(event: ValueChangeEvent<boolean>): void {
        this.playing.set(event.value);
        this.playingReason.set(event.details.reason);
    }
}
