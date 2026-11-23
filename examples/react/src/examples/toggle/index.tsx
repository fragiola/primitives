import { Toggle } from "@fragiola/primitives-react/toggle";
import { useState } from "react";
import { styles } from "./styles.ts";

// A track's actions: three toggle buttons, each named by its text, which never changes with the
// state (`aria-pressed` tells it). "Favourite" is controlled, "Mute" starts pressed, "Download"
// is disabled; a click, Enter or Space presses and releases the focused one (spec/toggle.md).
export default function TrackActions() {
    const [favourite, setFavourite] = useState(false);
    return (
        <div className={styles.card}>
            <div>
                <p className={styles.title}>Blue in Green</p>
                <p className={styles.subtitle}>Miles Davis · Kind of Blue</p>
            </div>
            <div className={styles.actions}>
                <Toggle
                    pressed={favourite}
                    onPressedChange={setFavourite}
                    className={styles.root}
                >
                    <span aria-hidden="true">♥</span>
                    Favourite
                </Toggle>
                <Toggle defaultPressed className={styles.root}>
                    Mute
                </Toggle>
                <Toggle disabled className={styles.root}>
                    Download
                </Toggle>
            </div>
            <p className={styles.status}>
                {favourite ? "In your favourites" : "Not in your favourites"}
            </p>
        </div>
    );
}
