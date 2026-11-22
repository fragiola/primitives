import { Drawer } from "@fragiola/primitives-react/drawer";
import { useState } from "react";
import { styles } from "./styles.ts";

// A cart in a side panel at the right edge: swipe it to the right, press Escape or "Continue
// shopping" to close it; "Remove" takes an item out (spec/drawer.md).
export default function CartPanel() {
    const [items, setItems] = useState(["Notebook", "Fountain pen"]);
    return (
        <div className={styles.stack}>
            <Drawer.Root swipeDirection="right">
                <Drawer.Trigger className={styles.trigger}>
                    {`Cart (${items.length})`}
                </Drawer.Trigger>
                <Drawer.Portal>
                    <Drawer.Backdrop className={styles.backdrop} />
                    <Drawer.Popup className={styles.popup}>
                        <Drawer.Title className={styles.title}>
                            Your cart
                        </Drawer.Title>
                        <Drawer.Description className={styles.description}>
                            {`${items.length} items, ready to check out.`}
                        </Drawer.Description>
                        <ul className={styles.items}>
                            {items.map((item) => (
                                <li key={item} className={styles.item}>
                                    {item}
                                    <button
                                        type="button"
                                        className={styles.remove}
                                        aria-label={`Remove ${item}`}
                                        onClick={() =>
                                            setItems((current) =>
                                                current.filter(
                                                    (other) => other !== item,
                                                ),
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <Drawer.Close className={styles.close}>
                            Continue shopping
                        </Drawer.Close>
                    </Drawer.Popup>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
