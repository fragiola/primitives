import { Slider } from "@fragiola/primitives-react/slider";
import { styles } from "./styles.ts";

const DOLLARS = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
} as const;

// A volume and a price range, each named by its label and showing its formatted value: drag a
// thumb or press the track; the arrows step, Page Up and Page Down jump by ten, Home and End go
// to the bounds, and the price thumbs stay ten apart (spec/slider.md).
export default function VolumeAndPrice() {
    return (
        <div className={styles.stack}>
            <Slider.Root defaultValue={50} className={styles.root}>
                <Slider.Label className={styles.label}>Volume</Slider.Label>
                <Slider.Control className={styles.control}>
                    <Slider.Track className={styles.track}>
                        <Slider.Indicator className={styles.indicator} />
                    </Slider.Track>
                    <Slider.Thumb className={styles.thumb} />
                </Slider.Control>
                <Slider.Value className={styles.value} />
            </Slider.Root>
            <Slider.Root
                defaultValue={[20, 80]}
                minStepsBetweenValues={10}
                format={DOLLARS}
                locale="en-US"
                className={styles.root}
            >
                <Slider.Label className={styles.label}>Price</Slider.Label>
                <Slider.Control className={styles.control}>
                    <Slider.Track className={styles.track}>
                        <Slider.Indicator className={styles.indicator} />
                    </Slider.Track>
                    <Slider.Thumb
                        aria-label="Minimum price"
                        className={styles.thumb}
                    />
                    <Slider.Thumb
                        aria-label="Maximum price"
                        className={styles.thumb}
                    />
                </Slider.Control>
                <Slider.Value className={styles.value} />
            </Slider.Root>
        </div>
    );
}
