import { Button } from "@fragiola/primitives-react/button";
import { useEffect, useState } from "react";
import { styles } from "./styles.ts";

// Publish a post: "Publish" stays focusable while it is busy (`focusableWhenDisabled`), so the
// keyboard does not lose its place; "Archive" is a `span` that behaves as a button
// (`nativeButton={false}`): Enter and Space press it (spec/button.md).
export default function PublishPost() {
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("Draft.");
    useEffect(() => {
        if (!busy) {
            return undefined;
        }
        const timer = setTimeout(() => {
            setBusy(false);
            setStatus("Published.");
        }, 1000);
        return () => clearTimeout(timer);
    }, [busy]);
    return (
        <div className={styles.stack}>
            <div className={styles.row}>
                <Button
                    disabled={busy}
                    focusableWhenDisabled
                    onClick={() => {
                        setBusy(true);
                        setStatus("Publishing…");
                    }}
                    className={styles.root}
                >
                    Publish
                </Button>
                <Button
                    nativeButton={false}
                    render={<span />}
                    disabled={busy}
                    onClick={() => setStatus("Archived.")}
                    className={styles.root}
                >
                    Archive
                </Button>
            </div>
            <p role="status" className={styles.status}>
                {status}
            </p>
        </div>
    );
}
