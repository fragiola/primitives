import { Checkbox } from "@fragiola/primitives-react/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-react/checkbox-group";
import { styles } from "./styles.ts";

// Pizza toppings: a CheckboxGroup whose parent checkbox checks or clears every topping and shows
// the mixed state in between; Space toggles the focused checkbox (spec/checkbox.md).
export default function PizzaToppings() {
    return (
        <CheckboxGroup
            aria-labelledby="toppings"
            defaultValue={["cheese"]}
            allValues={["cheese", "ham", "pineapple"]}
            className={styles.group}
        >
            <h2 id="toppings" className={styles.heading}>
                Toppings
            </h2>
            <div className={styles.row}>
                <Checkbox.Root id="all" parent className={styles.root}>
                    <Checkbox.Indicator className={styles.indicator} />
                </Checkbox.Root>
                <label htmlFor="all">All toppings</label>
            </div>
            <div className={styles.row}>
                <Checkbox.Root
                    id="cheese"
                    value="cheese"
                    className={styles.root}
                >
                    <Checkbox.Indicator className={styles.indicator} />
                </Checkbox.Root>
                <label htmlFor="cheese">Cheese</label>
            </div>
            <div className={styles.row}>
                <Checkbox.Root id="ham" value="ham" className={styles.root}>
                    <Checkbox.Indicator className={styles.indicator} />
                </Checkbox.Root>
                <label htmlFor="ham">Ham</label>
            </div>
            <div className={styles.row}>
                <Checkbox.Root
                    id="pineapple"
                    value="pineapple"
                    className={styles.root}
                >
                    <Checkbox.Indicator className={styles.indicator} />
                </Checkbox.Root>
                <label htmlFor="pineapple">Pineapple</label>
            </div>
        </CheckboxGroup>
    );
}
