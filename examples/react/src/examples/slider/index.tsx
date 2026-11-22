import { Slider } from "@fragiola/primitives-react/slider";
import { styles } from "./styles.ts";

const price = (value: number) => `$${value}`;

// A volume and a price range: drag a thumb or press the track; the arrows step, Page Up and
// Page Down jump by ten, Home and End go to the bounds, and the price thumbs stay ten apart
// (spec/slider.md).
export default function VolumeAndPrice() {
    return (
        <div className={styles.stack}>
            <div className={styles.row}>
                <span id="volume" className={styles.label}>
                    Volume
                </span>
                <Slider.Root defaultValue={50} className={styles.root}>
                    <Slider.Control className={styles.control}>
                        <Slider.Track className={styles.track}>
                            <Slider.Indicator className={styles.indicator} />
                        </Slider.Track>
                        <Slider.Thumb
                            aria-labelledby="volume"
                            className={styles.thumb}
                        />
                    </Slider.Control>
                </Slider.Root>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Price</span>
                <Slider.Root
                    defaultValue={[20, 80]}
                    minStepsBetweenValues={10}
                    className={styles.root}
                >
                    <Slider.Control className={styles.control}>
                        <Slider.Track className={styles.track}>
                            <Slider.Indicator className={styles.indicator} />
                        </Slider.Track>
                        <Slider.Thumb
                            aria-label="Minimum price"
                            getAriaValueText={price}
                            className={styles.thumb}
                        />
                        <Slider.Thumb
                            aria-label="Maximum price"
                            getAriaValueText={price}
                            className={styles.thumb}
                        />
                    </Slider.Control>
                </Slider.Root>
            </div>
        </div>
    );
}
