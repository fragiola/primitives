import { Switch } from "@fragiola/primitives-react/switch";
import { styles } from "./styles.ts";

// Quick settings: three switches, each named by its label; Space and Enter toggle the focused one,
// "Airplane mode" is disabled (spec/switch.md).
export default function QuickSettings() {
    return (
        <div className={styles.list}>
            <div className={styles.row}>
                <Switch.Root id="wifi" defaultChecked className={styles.root}>
                    <Switch.Thumb className={styles.thumb} />
                </Switch.Root>
                <label htmlFor="wifi">Wi-Fi</label>
            </div>
            <div className={styles.row}>
                <Switch.Root id="bluetooth" className={styles.root}>
                    <Switch.Thumb className={styles.thumb} />
                </Switch.Root>
                <label htmlFor="bluetooth">Bluetooth</label>
            </div>
            <div className={styles.row}>
                <Switch.Root id="airplane" disabled className={styles.root}>
                    <Switch.Thumb className={styles.thumb} />
                </Switch.Root>
                <label htmlFor="airplane">Airplane mode</label>
            </div>
        </div>
    );
}
