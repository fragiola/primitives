import { Tabs } from "../../kit/ui/tabs.tsx";

const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
];

/** spec/tabs.md, `/tabs/none-selected`: every tab disabled, so no tab is selected. */
export function TabsNoneSelected() {
    return (
        <Tabs.Root>
            <Tabs.List>
                {TABS.map((tab) => (
                    <Tabs.Tab key={tab.value} value={tab.value} disabled>
                        {tab.label}
                    </Tabs.Tab>
                ))}
                <Tabs.Indicator />
            </Tabs.List>
            {TABS.map((tab) => (
                <Tabs.Panel key={tab.value} value={tab.value}>
                    <p>{tab.label} settings</p>
                </Tabs.Panel>
            ))}
        </Tabs.Root>
    );
}
