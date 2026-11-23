import { SettingsTabs } from "./settings-tabs.tsx";

/** spec/tabs.md, `/tabs/nonce`: the Indicator's script under a Content Security Policy. */
export function TabsNonce() {
    return (
        <SettingsTabs
            activation="automatic"
            orientation="horizontal"
            nonce="fixture-nonce"
        />
    );
}
