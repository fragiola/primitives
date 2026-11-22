import { checkbox, checkboxGroup } from "examples-shared/recipes/checkbox";

// The example's classes: the Checkbox and CheckboxGroup recipes (one string per part), the
// heading and the rows. The indicator draws a check, or a dash while mixed.
export const styles = {
    ...checkbox,
    group: checkboxGroup.root,
    indicator: `${checkbox.indicator} after:content-['✓'] data-indeterminate:after:content-['–']`,
    heading: "font-semibold",
    row: "flex items-center gap-2",
};
