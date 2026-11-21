import { Tabs } from "@fragiola/primitives-react/tabs";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        value: "account",
        label: "Account",
        text: "Your name, your email address and the language of the interface.",
    },
    {
        value: "password",
        label: "Password",
        text: "Change your password and see where you are signed in.",
    },
    {
        value: "notifications",
        label: "Notifications",
        text: "Choose which events send you an email.",
    },
    {
        value: "billing",
        label: "Billing",
        text: "Billing is managed by your organization.",
        disabled: true,
    },
];

// Settings in tabs: the arrow keys move between tabs and select (automatic activation), Home and
// End jump, a disabled tab stays focusable but is never selected, and the indicator follows.
export default function SettingsTabs() {
    return (
        <Tabs.Root defaultValue="account" className={styles.root}>
            <Tabs.List aria-label="Account settings" className={styles.list}>
                {SECTIONS.map((section) => (
                    <Tabs.Tab
                        key={section.value}
                        value={section.value}
                        disabled={section.disabled}
                        className={styles.tab}
                    >
                        {section.label}
                    </Tabs.Tab>
                ))}
                <Tabs.Indicator className={styles.indicator} />
            </Tabs.List>
            {SECTIONS.map((section) => (
                <Tabs.Panel
                    key={section.value}
                    value={section.value}
                    className={styles.panel}
                >
                    <h3 className={styles.heading}>{section.label}</h3>
                    <p className={styles.text}>{section.text}</p>
                </Tabs.Panel>
            ))}
        </Tabs.Root>
    );
}
