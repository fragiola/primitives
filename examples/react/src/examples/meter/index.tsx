import { Meter } from "@fragiola/primitives-react/meter";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

// Storage and battery: a disk's use written in gigabytes (`format`), and a charge written as a
// percentage of the range, Meter's default (spec/meter.md).
export default function StorageMeter() {
    return (
        <div className={styles.stack}>
            <Meter.Root
                value={384}
                max={512}
                format={GIGABYTES}
                className={styles.root}
            >
                <Meter.Label className={styles.label}>Storage</Meter.Label>
                <Meter.Value className={styles.value} />
                <Meter.Track className={styles.track}>
                    <Meter.Indicator className={styles.indicator} />
                </Meter.Track>
            </Meter.Root>
            <Meter.Root value={60} className={styles.root}>
                <Meter.Label className={styles.label}>Battery</Meter.Label>
                <Meter.Value className={styles.value} />
                <Meter.Track className={styles.track}>
                    <Meter.Indicator className={styles.indicator} />
                </Meter.Track>
            </Meter.Root>
        </div>
    );
}
