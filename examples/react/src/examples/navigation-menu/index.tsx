import { NavigationMenu } from "@fragiola/primitives-react/navigation-menu";
import { styles } from "./styles.ts";

const PRODUCTS = [
    { href: "#analytics", title: "Analytics", text: "See how people use it." },
    { href: "#automation", title: "Automation", text: "Run the boring parts." },
    { href: "#reports", title: "Reports", text: "Share what you learned." },
];

const RESOURCES = [
    { href: "#guides", title: "Guides", text: "Step by step." },
    { href: "#blog", title: "Blog", text: "News and stories." },
    { href: "#videos", title: "Videos", text: "Watch and learn." },
    { href: "#community", title: "Community", text: "Ask and answer." },
];

// A site header: hover or press "Products" or "Resources" to disclose a panel of links, in one
// popup that resizes to each panel; the arrow keys move between the items, ArrowDown opens a
// panel with focus inside, Escape closes it (spec/navigation-menu.md).
export default function SiteHeader() {
    return (
        <header className={styles.header}>
            <span className={styles.brand}>Acme</span>
            <NavigationMenu.Root aria-label="Main" className={styles.root}>
                <NavigationMenu.List className={styles.list}>
                    <NavigationMenu.Item className={styles.item}>
                        <NavigationMenu.Trigger className={styles.trigger}>
                            Products
                            <NavigationMenu.Icon className={styles.icon} />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content className={styles.content}>
                            <ul className={styles.panel}>
                                {PRODUCTS.map((link) => (
                                    <li key={link.href}>
                                        <NavigationMenu.Link
                                            href={link.href}
                                            className={styles.contentLink}
                                        >
                                            <span className={styles.linkTitle}>
                                                {link.title}
                                            </span>
                                            <span
                                                className={
                                                    styles.linkDescription
                                                }
                                            >
                                                {link.text}
                                            </span>
                                        </NavigationMenu.Link>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item className={styles.item}>
                        <NavigationMenu.Trigger className={styles.trigger}>
                            Resources
                            <NavigationMenu.Icon className={styles.icon} />
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content className={styles.content}>
                            <ul className={styles.grid}>
                                {RESOURCES.map((link) => (
                                    <li key={link.href}>
                                        <NavigationMenu.Link
                                            href={link.href}
                                            className={styles.contentLink}
                                        >
                                            <span className={styles.linkTitle}>
                                                {link.title}
                                            </span>
                                            <span
                                                className={
                                                    styles.linkDescription
                                                }
                                            >
                                                {link.text}
                                            </span>
                                        </NavigationMenu.Link>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item className={styles.item}>
                        <NavigationMenu.Link
                            href="#pricing"
                            className={styles.link}
                        >
                            Pricing
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
                <NavigationMenu.Portal>
                    <NavigationMenu.Positioner
                        sideOffset={8}
                        className={styles.positioner}
                    >
                        <NavigationMenu.Popup className={styles.popup}>
                            <NavigationMenu.Arrow className={styles.arrow} />
                            <NavigationMenu.Viewport
                                className={styles.viewport}
                            />
                        </NavigationMenu.Popup>
                    </NavigationMenu.Positioner>
                </NavigationMenu.Portal>
            </NavigationMenu.Root>
        </header>
    );
}
