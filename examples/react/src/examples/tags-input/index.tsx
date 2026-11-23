import {
    TagsInput,
    type TagsInputInvalidDetails,
} from "@fragiola/primitives-react/tags-input";
import { useState } from "react";
import { styles } from "./styles.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email recipients: Enter, a comma or a paste turns the typed text into recipients
// (spec/tags-input.md). A text that is no address, or one already there, is refused: it stays in
// the field and the message says why. Backspace at the start reaches the last recipient (a second
// one removes it), a double press edits one, and leaving the field adds what was typed.
export default function EmailRecipients() {
    const [message, setMessage] = useState("");
    const explain = (text: string, details: TagsInputInvalidDetails) =>
        setMessage(
            details.cause === "duplicate"
                ? `${text} is already a recipient.`
                : `${text} is not an email address.`,
        );
    return (
        <div className={styles.stack}>
            <label htmlFor="recipients" className={styles.label}>
                To
            </label>
            <TagsInput.Root
                defaultValue={["ada@example.com", "grace@example.com"]}
                validate={(text) => EMAIL.test(text)}
                editable
                blurBehavior="add"
                onValueChange={() => setMessage("")}
                onValueInvalid={explain}
                className={styles.root}
            >
                {({ value }) => (
                    <>
                        <TagsInput.Control className={styles.control}>
                            {value.map((email, index) => (
                                <TagsInput.Tag
                                    // biome-ignore lint/suspicious/noArrayIndexKey: a tag is its place in the value
                                    key={index}
                                    index={index}
                                    className={styles.tag}
                                >
                                    <TagsInput.TagText
                                        className={styles.tagText}
                                    >
                                        {email}
                                    </TagsInput.TagText>
                                    <TagsInput.TagInput
                                        aria-label="Edit recipient"
                                        className={styles.tagInput}
                                    />
                                    <TagsInput.TagRemove
                                        aria-label={`Remove ${email}`}
                                        className={styles.tagRemove}
                                    >
                                        ×
                                    </TagsInput.TagRemove>
                                </TagsInput.Tag>
                            ))}
                            <TagsInput.Input
                                id="recipients"
                                className={styles.input}
                            />
                        </TagsInput.Control>
                        <TagsInput.ClearTrigger
                            aria-label="Clear recipients"
                            className={styles.clearTrigger}
                        >
                            ×
                        </TagsInput.ClearTrigger>
                    </>
                )}
            </TagsInput.Root>
            <p role="status" className={styles.status}>
                {message}
            </p>
        </div>
    );
}
