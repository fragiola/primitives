import { Separator } from "@fragiola/primitives-react/separator";
import { styles } from "./styles.ts";

// A profile card: a horizontal separator between its sections, vertical ones between its links,
// and a decorative one that assistive technologies skip (spec/separator.md).
export default function ProfileCard() {
    return (
        <div className={styles.card}>
            <p className={styles.heading}>Ada Lovelace</p>
            <p className={styles.text}>Analyst and metaphysician.</p>
            <Separator className={styles.root} />
            <div className={styles.row}>
                <a href="#notes" className={styles.link}>
                    Notes
                </a>
                <Separator orientation="vertical" className={styles.root} />
                <a href="#letters" className={styles.link}>
                    Letters
                </a>
                <Separator orientation="vertical" className={styles.root} />
                <a href="#engine" className={styles.link}>
                    Engine
                </a>
            </div>
            <Separator decorative className={styles.root} />
        </div>
    );
}
