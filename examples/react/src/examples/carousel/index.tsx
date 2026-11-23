import { Carousel } from "@fragiola/primitives-react/carousel";
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
export default function ImageCarousel() {
    return (
        <Carousel.Root
            aria-label="Featured destinations"
            slideCount={PHOTOS.length}
            defaultPlaying
            loop
            className={styles.root}
        >
            <Carousel.AutoplayTrigger className={styles.control}>
                {({ playing }) =>
                    playing ? "Stop slide rotation" : "Start slide rotation"
                }
            </Carousel.AutoplayTrigger>
            <Carousel.ItemGroup className={styles.itemGroup}>
                {PHOTOS.map((photo, index) => (
                    <Carousel.Item
                        key={photo.city}
                        index={index}
                        aria-label={`${index + 1} of ${PHOTOS.length}`}
                        className={styles.item}
                    >
                        <div
                            role="img"
                            aria-label={photo.alt}
                            className={styles.photos[photo.tone]}
                        >
                            <span className={styles.caption}>{photo.city}</span>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel.ItemGroup>
            <div className={styles.controls}>
                <Carousel.PrevTrigger
                    aria-label="Previous slide"
                    className={styles.control}
                >
                    ‹
                </Carousel.PrevTrigger>
                <Carousel.IndicatorGroup
                    aria-label="Choose slide to display"
                    className={styles.indicatorGroup}
                >
                    {PHOTOS.map((photo, index) => (
                        <Carousel.Indicator
                            key={photo.city}
                            index={index}
                            aria-label={`Slide ${index + 1}`}
                            className={styles.indicator}
                        />
                    ))}
                </Carousel.IndicatorGroup>
                <Carousel.NextTrigger
                    aria-label="Next slide"
                    className={styles.control}
                >
                    ›
                </Carousel.NextTrigger>
            </div>
        </Carousel.Root>
    );
}
