import { TagGroup } from "@fragiola/primitives-react/tag-group";
import { useState } from "react";
import { styles } from "./styles.ts";

const TOPICS = [
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "research", label: "Research" },
    { value: "writing", label: "Writing" },
];

const ARTICLES = [
    { title: "Color systems that scale", topic: "design" },
    { title: "Profiling a slow render", topic: "engineering" },
    { title: "Interviewing fifty users", topic: "research" },
    { title: "Type for the screen", topic: "design" },
    { title: "A token pipeline", topic: "engineering" },
    { title: "Release notes people read", topic: "writing" },
];

// Filter tags: the topics are a TagGroup that selects several (spec/tag-group.md). Selected
// topics narrow the articles to theirs; with none selected, every topic's articles show. Removing
// a topic (Delete, Backspace, its remove button) drops it and its articles: the app owns the tags,
// so `onRemove` removes the entry, and the selection with it.
export default function FilterTags() {
    const [topics, setTopics] = useState(TOPICS);
    const [selected, setSelected] = useState<string[]>([]);
    const shown = ARTICLES.filter(
        (article) =>
            topics.some((topic) => topic.value === article.topic) &&
            (selected.length === 0 || selected.includes(article.topic)),
    );
    const labelOf = (value: string) =>
        TOPICS.find((topic) => topic.value === value)?.label ?? value;
    return (
        <div className={styles.stack}>
            <TagGroup.Root
                selectionMode="multiple"
                value={selected}
                onValueChange={setSelected}
                onRemove={(value) => {
                    setTopics(topics.filter((topic) => topic.value !== value));
                    setSelected(selected.filter((each) => each !== value));
                }}
                className={styles.root}
            >
                <TagGroup.Label className={styles.label}>Topics</TagGroup.Label>
                <TagGroup.List className={styles.list}>
                    {topics.map((topic) => (
                        <TagGroup.Tag
                            key={topic.value}
                            value={topic.value}
                            className={styles.tag}
                        >
                            <TagGroup.TagCell className={styles.tagCell}>
                                {topic.label}
                                <TagGroup.RemoveButton
                                    aria-label={`Remove ${topic.label}`}
                                    className={styles.removeButton}
                                >
                                    ×
                                </TagGroup.RemoveButton>
                            </TagGroup.TagCell>
                        </TagGroup.Tag>
                    ))}
                </TagGroup.List>
                {topics.length === 0 ? (
                    <p className={styles.empty}>No topics left.</p>
                ) : null}
            </TagGroup.Root>
            <ul aria-label="Articles" className={styles.articles}>
                {shown.map((article) => (
                    <li key={article.title} className={styles.article}>
                        {article.title}
                        <span className={styles.topic}>
                            {labelOf(article.topic)}
                        </span>
                    </li>
                ))}
            </ul>
            <p role="status" className={styles.status}>
                {`Showing ${shown.length} of ${ARTICLES.length} articles.`}
            </p>
        </div>
    );
}
