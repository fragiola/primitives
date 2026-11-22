import { Avatar } from "@fragiola/primitives-react/avatar";
import { styles } from "./styles.ts";

// Inline images, so the example needs no file: a portrait, and data that is no image (a broken
// image with no failed request to log).
const BROKEN = "data:image/png;base64,AAAA";
const PORTRAIT =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%232f6f8f'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23f2d4b6'/%3E%3C/svg%3E";

// The team: an image shown once it has loaded, a broken image that shows its initials instead,
// and initials with a delay, so a fast image would never flash them (spec/avatar.md).
export default function TeamAvatars() {
    return (
        <div className={styles.row}>
            <Avatar.Root className={styles.root}>
                <Avatar.Image
                    src={PORTRAIT}
                    alt="Ada Lovelace"
                    className={styles.image}
                />
                <Avatar.Fallback className={styles.fallback}>
                    AL
                </Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root className={styles.root}>
                <Avatar.Image
                    src={BROKEN}
                    alt="Grace Hopper"
                    className={styles.image}
                />
                <Avatar.Fallback className={styles.fallback}>
                    GH
                </Avatar.Fallback>
            </Avatar.Root>
            <Avatar.Root className={styles.root}>
                <Avatar.Fallback delay={300} className={styles.fallback}>
                    KJ
                </Avatar.Fallback>
            </Avatar.Root>
        </div>
    );
}
