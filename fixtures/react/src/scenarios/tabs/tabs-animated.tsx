import { tabs } from "examples-shared/recipes/tabs";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Tabs } from "../../kit/ui/tabs.tsx";

const TABS = [
    { value: "overview", label: "Overview" },
    { value: "projects", label: "Projects" },
    { value: "settings", label: "Settings" },
];

/** spec/tabs.md, `/tabs/animated` (and `?dir=rtl`): panels that enter and exit. */
export function TabsAnimated() {
    const [value, setValue] = useState<string>();
    return (
        <>
            <Tabs.Root defaultValue="overview" onValueChange={setValue}>
                <Tabs.List>
                    {TABS.map((tab) => (
                        <Tabs.Tab key={tab.value} value={tab.value}>
                            {tab.label}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator />
                </Tabs.List>
                <div className={tabs.panels}>
                    {TABS.map((tab) => (
                        <Tabs.Panel
                            key={tab.value}
                            value={tab.value}
                            keepMounted
                            className={`${tabs.panel} ${tabs.motion}`}
                        >
                            <p>{tab.label} content</p>
                        </Tabs.Panel>
                    ))}
                </div>
            </Tabs.Root>
            <Output values={{ value }} />
        </>
    );
}
