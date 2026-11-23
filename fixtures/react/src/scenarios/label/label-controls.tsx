import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Checkbox } from "../../kit/ui/checkbox.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";
import { Slider } from "../../kit/ui/slider.tsx";
import { Switch } from "../../kit/ui/switch.tsx";

/** spec/label.md, `/label/controls` */
export function LabelControls() {
    const [subscribe, setSubscribe] = useState<boolean>();
    const [notifications, setNotifications] = useState<boolean>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="email">Email</Label>
                    <input
                        id="email"
                        type="text"
                        className="rounded-md border px-2"
                    />
                </div>
                <Label>
                    <Checkbox.Root
                        onCheckedChange={(checked: boolean) =>
                            setSubscribe(checked)
                        }
                    />
                    Subscribe
                </Label>
                <div className="flex items-center gap-2">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Switch.Root
                        id="notifications"
                        onCheckedChange={(checked: boolean) =>
                            setNotifications(checked)
                        }
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <NumberField.Root
                        id="quantity"
                        defaultValue={1}
                        locale="en-US"
                    >
                        <NumberField.Group>
                            <NumberField.Input />
                        </NumberField.Group>
                    </NumberField.Root>
                </div>
                <div className="flex items-center gap-2">
                    <Label id="volume-label" htmlFor="volume">
                        Volume
                    </Label>
                    <Slider.Root defaultValue={40}>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Indicator />
                            </Slider.Track>
                            <Slider.Thumb
                                id="volume"
                                aria-labelledby="volume-label"
                            />
                        </Slider.Control>
                    </Slider.Root>
                </div>
            </div>
            <Output values={{ subscribe, notifications }} />
        </>
    );
}
