import { Field } from "../../kit/ui/field.tsx";
import { Form } from "../../kit/ui/form.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { SKILLS, validateSkills } from "./tags.ts";

const DISABLED_KEYS = ["design"];

/** A TagGroup in a Field of a Form, its first tag disabled (spec/tag-group.md, `/tag-group/form`). */
export function TagGroupForm() {
    return (
        <Form onSubmit={(event) => event.preventDefault()}>
            <Field.Root name="skills" validate={validateSkills}>
                <Field.Label>Skills</Field.Label>
                <TagGroup.Root
                    selectionMode="multiple"
                    disabledKeys={DISABLED_KEYS}
                >
                    <TagGroup.List>
                        <TagGroupTags tags={SKILLS} />
                    </TagGroup.List>
                </TagGroup.Root>
                <Field.Error />
            </Field.Root>
            <button type="submit">Submit</button>
        </Form>
    );
}
