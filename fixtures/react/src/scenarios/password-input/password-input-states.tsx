import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { PasswordInput } from "../../kit/ui/password-input.tsx";

/** A disabled and a read-only PasswordInput (spec/password-input.md, `/password-input/states`). */
export function PasswordInputStates() {
    const [visible, setVisible] = useState<boolean>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <label htmlFor="pin" className="text-sm font-medium">
                    PIN
                </label>
                <PasswordInput.Root
                    id="pin"
                    disabled
                    defaultValue="1234"
                    onVisibleChange={setVisible}
                >
                    <PasswordInput.Input />
                    <PasswordInput.VisibilityTrigger aria-label="Show PIN" />
                </PasswordInput.Root>
                <label htmlFor="recovery" className="text-sm font-medium">
                    Recovery key
                </label>
                <PasswordInput.Root
                    id="recovery"
                    readOnly
                    defaultVisible
                    defaultValue="abcd-efgh"
                    onVisibleChange={setVisible}
                >
                    <PasswordInput.Input />
                    <PasswordInput.VisibilityTrigger aria-label="Show recovery key" />
                </PasswordInput.Root>
            </div>
            <Output values={{ visible }} />
        </>
    );
}
