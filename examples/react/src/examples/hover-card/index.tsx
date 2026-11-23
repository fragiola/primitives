import { HoverCard } from "@fragiola/primitives-react/hover-card";
import { styles } from "./styles.ts";

// A user profile preview: hovering or focusing the link shows the card after a delay; the pointer
// can cross over to it, Escape or a press outside closes it, and the link still goes to the page.
export default function ProfilePreview() {
    return (
        <p className={styles.text}>
            {"Reviewed by "}
            <HoverCard.Root delay={400} closeDelay={200}>
                <HoverCard.Trigger href="#ada" className={styles.trigger}>
                    @ada
                </HoverCard.Trigger>
                <HoverCard.Portal>
                    <HoverCard.Positioner
                        sideOffset={8}
                        className={styles.positioner}
                    >
                        <HoverCard.Popup className={styles.popup}>
                            <HoverCard.Arrow className={styles.arrow} />
                            <div className={styles.header}>
                                <span
                                    className={styles.avatar}
                                    aria-hidden="true"
                                >
                                    AL
                                </span>
                                <div>
                                    <div className={styles.name}>
                                        Ada Lovelace
                                    </div>
                                    <div className={styles.handle}>@ada</div>
                                </div>
                            </div>
                            <p className={styles.bio}>
                                Mathematician and writer of the first published
                                program.
                            </p>
                            <div className={styles.stats}>
                                <span>42 reviews</span>
                                <span>7 repositories</span>
                            </div>
                        </HoverCard.Popup>
                    </HoverCard.Positioner>
                </HoverCard.Portal>
            </HoverCard.Root>
            {" approved this change."}
        </p>
    );
}
