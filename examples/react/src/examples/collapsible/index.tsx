import { Collapsible } from "@fragiola/primitives-react/collapsible";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        label: "Workspace",
        links: ["Overview", "Members", "Billing"],
        defaultOpen: true,
    },
    { label: "Projects", links: ["Website", "Mobile app", "Design system"] },
    { label: "Archived", links: ["Old landing page", "2025 campaign"] },
];

// A settings sidebar: each section's button shows and hides its links, and the panels' height
// animates from their size variable. The closed panels are hidden until found, so the browser's
// find-in-page opens the section that holds a match (spec/collapsible.md).
export default function SettingsSidebar() {
    return (
        <nav aria-label="Settings" className={styles.sidebar}>
            {SECTIONS.map((section) => (
                <Collapsible.Root
                    key={section.label}
                    defaultOpen={section.defaultOpen}
                    className={styles.root}
                >
                    <Collapsible.Trigger className={styles.trigger}>
                        {section.label}
                    </Collapsible.Trigger>
                    <Collapsible.Panel
                        hiddenUntilFound
                        className={styles.panel}
                    >
                        <ul className={styles.list}>
                            {section.links.map((link) => (
                                <li key={link}>
                                    <a
                                        href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                                        className={styles.link}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Collapsible.Panel>
                </Collapsible.Root>
            ))}
        </nav>
    );
}
