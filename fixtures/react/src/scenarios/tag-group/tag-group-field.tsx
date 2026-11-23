import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { TagGroup } from "../../kit/ui/tag-group.tsx";
import { TagGroupTags } from "./tag-group-tags.tsx";
import { printList, SKILLS } from "./tags.ts";

/** A TagGroup labelled and described by a Field (spec/tag-group.md, `/tag-group/field`). */
export function TagGroupField() {
    const [value, setValue] = useState<string>();
    return (
        <>
            <Field.Root>
                <Field.Label>Skills</Field.Label>
                <TagGroup.Root
                    selectionMode="multiple"
                    onValueChange={(next: string[]) =>
                        setValue(printList(next))
                    }
                >
                    <TagGroup.List>
                        <TagGroupTags tags={SKILLS} />
                    </TagGroup.List>
                </TagGroup.Root>
                <Field.Description>Your strongest skills.</Field.Description>
            </Field.Root>
            <Output values={{ value }} />
        </>
    );
}
