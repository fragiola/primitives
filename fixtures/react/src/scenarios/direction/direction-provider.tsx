import {
    DirectionProvider,
    useDirection,
} from "@fragiola/primitives-react/direction";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { Menu } from "../../kit/ui/menu.tsx";
import { Slider } from "../../kit/ui/slider.tsx";
import { Tabs } from "../../kit/ui/tabs.tsx";

const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
    { value: "billing", label: "Billing", disabled: true },
    { value: "team", label: "Team" },
];

/** What `useDirection()` reads inside the provider. */
function DirectionOutput() {
    return <Output values={{ direction: useDirection() }} />;
}

export function DirectionProviderScenario() {
    return (
        <DirectionProvider direction="rtl">
            <div className="flex flex-col items-start gap-6">
                <Tabs.Root defaultValue="account">
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
                        <Tabs.Indicator renderBeforeHydration />
                    </Tabs.List>
                    {TABS.map((tab) => (
                        <Tabs.Panel key={tab.value} value={tab.value}>
                            <p>{tab.label} settings</p>
                        </Tabs.Panel>
                    ))}
                </Tabs.Root>
                <Slider.Root defaultValue={50}>
                    <Slider.Control>
                        <Slider.Track>
                            <Slider.Indicator />
                            <Slider.Thumb aria-label="Volume" />
                        </Slider.Track>
                    </Slider.Control>
                </Slider.Root>
                <div className="ms-96">
                    <Menu.Root>
                        <Menu.Trigger>File</Menu.Trigger>
                        <Menu.Portal>
                            <Menu.Positioner sideOffset={4}>
                                <Menu.Popup>
                                    <Menu.Item>New file</Menu.Item>
                                    <Menu.SubmenuRoot>
                                        <Menu.SubmenuTrigger>
                                            Share
                                        </Menu.SubmenuTrigger>
                                        <Menu.Portal>
                                            <Menu.Positioner>
                                                <Menu.Popup>
                                                    <Menu.Item>Email</Menu.Item>
                                                    <Menu.Item>Link</Menu.Item>
                                                </Menu.Popup>
                                            </Menu.Positioner>
                                        </Menu.Portal>
                                    </Menu.SubmenuRoot>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                </div>
                <Calendar.Root locale="en-US">
                    <MonthView />
                </Calendar.Root>
            </div>
            <DirectionOutput />
        </DirectionProvider>
    );
}
