import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Tabs } from "../../kit/ui/tabs.tsx";

const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
    { value: "billing", label: "Billing", disabled: true },
    { value: "team", label: "Team" },
];

/** The tabs of every tabs scenario (spec/tabs.md). */
export function SettingsTabs({
    activation,
    orientation,
    nonce,
}: {
    activation: "automatic" | "manual";
    orientation: "horizontal" | "vertical";
    /** `/tabs/nonce`: the Indicator script's nonce. */
    nonce?: string;
}) {
    const [value, setValue] = useState("account");
    return (
        <>
            <Tabs.Root
                value={value}
                onValueChange={setValue}
                activation={activation}
                orientation={orientation}
            >
                <Tabs.List>
                    {TABS.map((tab) => (
                        <Tabs.Tab
                            key={tab.value}
                            value={tab.value}
                            disabled={tab.disabled}
                        >
                            {tab.label}
                        </Tabs.Tab>
                    ))}
                    <Tabs.Indicator renderBeforeHydration nonce={nonce} />
                </Tabs.List>
                {TABS.map((tab) => (
                    <Tabs.Panel key={tab.value} value={tab.value}>
                        <p>{tab.label} settings</p>
                    </Tabs.Panel>
                ))}
            </Tabs.Root>
            <button type="button" className="mt-2">
                After tabs
            </button>
            <Output values={{ value }} />
        </>
    );
}
