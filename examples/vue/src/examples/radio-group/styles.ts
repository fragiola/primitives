import { button } from "examples-shared/recipes/button";
import { field } from "examples-shared/recipes/field";
import { form } from "examples-shared/recipes/form";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import { switchControl } from "examples-shared/recipes/switch";

// The example's classes: the Form and Field recipes, the RadioGroup and Radio recipes, the
// Switch recipe, the Button recipe for "Save", the rows and the status.
export const styles = {
    form: form.root,
    field,
    group: radioGroup.root,
    radio,
    switch: switchControl,
    submit: button.root,
    row: "flex items-center gap-2",
    status: "text-palette-accent/85",
};
