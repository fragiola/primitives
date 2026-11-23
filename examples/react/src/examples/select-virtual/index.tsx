import {
    Select,
    SelectVirtual,
} from "@fragiola/primitives-react/select-virtual";
import { styles } from "./styles.ts";

// 5 000 made-up countries, the same on every load: a start, a vowel and an ending ("Aldabria" …
// "Zanuzia"), in alphabetical order.
const STARTS =
    "Ald Bar Cor Dun Elm Fen Gal Har Isk Jor Kel Lor Mar Nor Orl Pel Qir Ros Sar Tel Ulm Val Wen Yar Zan";
const ENDINGS =
    "bria burg dale dor dova fell gal gard goria heim holm kesh land lia lis lor mark mere mont nar nesia nia nora pura quay ra ria rin ros sha sia stan thal tia tor va vel via wick zia";
const COUNTRIES = STARTS.split(" ")
    .flatMap((start) =>
        [..."aeiou"].flatMap((vowel) =>
            ENDINGS.split(" ").map((ending) => start + vowel + ending),
        ),
    )
    .sort()
    .map((name) => ({ value: name.toLowerCase(), label: name }));

// A country list of thousands: the list renders only the countries in view, yet the arrows, Home
// and End and the typeahead reach every one of them, and each option keeps its place in the set
// (spec/virtual-lists.md).
export default function CountryList() {
    return (
        <div className={styles.stack}>
            <label htmlFor="country" className={styles.label}>
                Country
            </label>
            <Select.Root items={COUNTRIES} name="country">
                <Select.Trigger id="country" className={styles.trigger}>
                    <Select.Value
                        placeholder="Choose a country"
                        className={styles.value}
                    />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className={styles.positioner}>
                        <Select.Popup className={styles.popup}>
                            <SelectVirtual.List className={styles.list}>
                                {(country) => (
                                    <Select.Item
                                        value={country.value}
                                        className={styles.item}
                                    >
                                        {country.label}
                                        <Select.ItemIndicator
                                            className={styles.itemIndicator}
                                        >
                                            ✓
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                )}
                            </SelectVirtual.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}
