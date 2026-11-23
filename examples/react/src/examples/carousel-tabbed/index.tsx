import { Carousel } from "@fragiola/primitives-react/carousel";
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
export default function FeatureTour() {
    return (
        <Carousel.Root
            aria-label="Feature tour"
            variant="tabbed"
            slideCount={FEATURES.length}
            className={styles.root}
        >
            <Carousel.IndicatorGroup
                aria-label="Choose slide to display"
                className={styles.indicatorGroup}
            >
                {FEATURES.map((feature, index) => (
                    <Carousel.Indicator
                        key={feature.tab}
                        index={index}
                        className={styles.tab}
                    >
                        {feature.tab}
                    </Carousel.Indicator>
                ))}
            </Carousel.IndicatorGroup>
            <Carousel.ItemGroup className={styles.itemGroup}>
                {FEATURES.map((feature, index) => (
                    <Carousel.Item
                        key={feature.tab}
                        index={index}
                        aria-label={`${index + 1} of ${FEATURES.length}`}
                        className={styles.item}
                    >
                        <div className={styles.card}>
                            <h3 className={styles.title}>{feature.title}</h3>
                            <p className={styles.text}>{feature.text}</p>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel.ItemGroup>
        </Carousel.Root>
    );
}
