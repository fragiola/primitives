import { Component } from "@angular/core";
import {
    CarouselIndicator,
    CarouselIndicatorGroup,
    CarouselItem,
    CarouselItemGroup,
    CarouselRoot,
} from "@fragiola/primitives-angular/carousel";
import { styles } from "./styles.ts";

const FEATURES = [
    {
        tab: "Sync",
        title: "Sync everywhere",
        text: "Your notes on every device, offline too.",
    },
    {
        tab: "Share",
        title: "Share with anyone",
        text: "A link that opens for people you choose.",
    },
    {
        tab: "Secure",
        title: "Secure by default",
        text: "Encrypted before it leaves your device.",
    },
];

// A tabbed carousel (spec/carousel.md, the APG's tabbed style): the Indicators are a tablist, each
// slide a tabpanel; the arrow keys move between the tabs and show their slides.
@Component({
    selector: "example-feature-tour",
    imports: [
        CarouselRoot,
        CarouselIndicatorGroup,
        CarouselIndicator,
        CarouselItemGroup,
        CarouselItem,
    ],
    template: `
        <div carouselRoot aria-label="Feature tour" variant="tabbed" [slideCount]="features.length" [class]="styles.root">
            <div carouselIndicatorGroup aria-label="Choose slide to display" [class]="styles.indicatorGroup">
                @for (feature of features; track feature.tab; let index = $index) {
                    <button carouselIndicator [index]="index" [class]="styles.tab">{{ feature.tab }}</button>
                }
            </div>
            <div carouselItemGroup [class]="styles.itemGroup">
                @for (feature of features; track feature.tab; let index = $index) {
                    <div carouselItem [index]="index" [attr.aria-label]="index + 1 + ' of ' + features.length" [class]="styles.item">
                        <div [class]="styles.card">
                            <h3 [class]="styles.title">{{ feature.title }}</h3>
                            <p [class]="styles.text">{{ feature.text }}</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    `,
})
export default class FeatureTour {
    protected readonly styles = styles;
    protected readonly features = FEATURES;
}
