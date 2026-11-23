import { Component } from "@angular/core";
import {
    CarouselAutoplayTrigger,
    CarouselIndicator,
    CarouselIndicatorGroup,
    CarouselItem,
    CarouselItemGroup,
    CarouselNextTrigger,
    CarouselPrevTrigger,
    CarouselRoot,
} from "@fragiola/primitives-angular/carousel";
import { styles } from "./styles.ts";

const PHOTOS = [
    {
        city: "Lisbon",
        alt: "A yellow tram climbing a street in Lisbon",
        tone: "lisbon" as const,
    },
    {
        city: "Kyoto",
        alt: "Cherry blossoms over a temple in Kyoto",
        tone: "kyoto" as const,
    },
    {
        city: "Reykjavík",
        alt: "Northern lights over Reykjavík",
        tone: "reykjavik" as const,
    },
    {
        city: "Cusco",
        alt: "Terraced hills above Cusco",
        tone: "cusco" as const,
    },
];

// An image carousel that rotates (spec/carousel.md, the APG's): its rotation control first, which
// focus inside the carousel stops and a hover pauses; Previous and Next loop; a dot per slide.
@Component({
    selector: "example-image-carousel",
    imports: [
        CarouselRoot,
        CarouselAutoplayTrigger,
        CarouselItemGroup,
        CarouselItem,
        CarouselPrevTrigger,
        CarouselNextTrigger,
        CarouselIndicatorGroup,
        CarouselIndicator,
    ],
    template: `
        <div carouselRoot aria-label="Featured destinations" [slideCount]="photos.length" defaultPlaying loop [class]="styles.root">
            <button carouselAutoplayTrigger #rotation="carouselAutoplayTrigger" [class]="styles.control">{{ rotation.state().playing ? "Stop slide rotation" : "Start slide rotation" }}</button>
            <div carouselItemGroup [class]="styles.itemGroup">
                @for (photo of photos; track photo.city; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="index + 1 + ' of ' + photos.length" [class]="styles.item">
                        <div role="img" [attr.aria-label]="photo.alt" [class]="styles.photos[photo.tone]">
                            <span [class]="styles.caption">{{ photo.city }}</span>
                        </div>
                    </div>
                }
            </div>
            <div [class]="styles.controls">
                <button carouselPrevTrigger aria-label="Previous slide" [class]="styles.control">‹</button>
                <div carouselIndicatorGroup aria-label="Choose slide to display" [class]="styles.indicatorGroup">
                    @for (photo of photos; track photo.city; let index = $index) {
                        <button carouselIndicator [index]="index" [attr.aria-label]="'Slide ' + (index + 1)" [class]="styles.indicator"></button>
                    }
                </div>
                <button carouselNextTrigger aria-label="Next slide" [class]="styles.control">›</button>
            </div>
        </div>
    `,
})
export default class ImageCarousel {
    protected readonly styles = styles;
    protected readonly photos = PHOTOS;
}
