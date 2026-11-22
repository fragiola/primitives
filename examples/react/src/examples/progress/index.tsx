import { Progress } from "@fragiola/primitives-react/progress";
import { useState } from "react";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

// Uploads and storage: an upload's progress written as a percentage, which "Add 25%" moves and
// "Unknown" makes indeterminate; a disk's use written in gigabytes (`format`, spec/progress.md).
export default function UploadProgress() {
    const [value, setValue] = useState<number | null>(25);
    return (
        <div className={styles.stack}>
            <Progress.Root value={value} className={styles.root}>
                <Progress.Label className={styles.label}>Upload</Progress.Label>
                <Progress.Value className={styles.value} />
                <Progress.Track className={styles.track}>
                    <Progress.Indicator className={styles.indicator} />
                </Progress.Track>
            </Progress.Root>
            <div className={styles.row}>
                <button
                    type="button"
                    onClick={() =>
                        setValue((current) =>
                            Math.min((current ?? 0) + 25, 100),
                        )
                    }
                    className={styles.button}
                >
                    Add 25%
                </button>
                <button
                    type="button"
                    onClick={() => setValue(null)}
                    className={styles.button}
                >
                    Unknown
                </button>
                <button
                    type="button"
                    onClick={() => setValue(0)}
                    className={styles.button}
                >
                    Reset
                </button>
            </div>
            <Progress.Root
                value={128}
                max={512}
                format={GIGABYTES}
                className={styles.root}
            >
                <Progress.Label className={styles.label}>
                    Storage
                </Progress.Label>
                <Progress.Value className={styles.value} />
                <Progress.Track className={styles.track}>
                    <Progress.Indicator className={styles.indicator} />
                </Progress.Track>
            </Progress.Root>
        </div>
    );
}
