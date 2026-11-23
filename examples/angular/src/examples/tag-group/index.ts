import { Component, computed, signal } from "@angular/core";
import {
    TagGroupLabel,
    TagGroupList,
    TagGroupRemoveButton,
    TagGroupRoot,
    TagGroupTag,
    TagGroupTagCell,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/tag-group";
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
// so `(remove)` removes the entry, and the selection with it.
@Component({
    selector: "example-filter-tags",
    imports: [
        TagGroupRoot,
        TagGroupLabel,
        TagGroupList,
        TagGroupTag,
        TagGroupTagCell,
        TagGroupRemoveButton,
    ],
    template: `
        <div [class]="styles.stack">
            <div tagGroupRoot selectionMode="multiple" [(value)]="selected" removable (remove)="remove($event)" [class]="styles.root">
                <span tagGroupLabel [class]="styles.label">Topics</span>
                <div tagGroupList [class]="styles.list">
                    @for (topic of topics(); track topic.value) {
                        <div tagGroupTag [value]="topic.value" [class]="styles.tag">
                            <div tagGroupTagCell [class]="styles.tagCell">{{ topic.label }}<button tagGroupRemoveButton [attr.aria-label]="'Remove ' + topic.label" [class]="styles.removeButton">×</button></div>
                        </div>
                    }
                </div>
                @if (topics().length === 0) {
                    <p [class]="styles.empty">No topics left.</p>
                }
            </div>
            <ul aria-label="Articles" [class]="styles.articles">
                @for (article of shown(); track article.title) {
                    <li [class]="styles.article">{{ article.title }}<span [class]="styles.topic">{{ labelOf(article.topic) }}</span></li>
                }
            </ul>
            <p role="status" [class]="styles.status">{{ count() }}</p>
        </div>
    `,
})
export default class FilterTags {
    protected readonly styles = styles;
    protected readonly topics = signal(TOPICS);
    protected readonly selected = signal<readonly string[]>([]);
    protected readonly shown = computed(() => {
        const selected = this.selected();
        return ARTICLES.filter(
            (article) =>
                this.topics().some((topic) => topic.value === article.topic) &&
                (selected.length === 0 || selected.includes(article.topic)),
        );
    });
    protected readonly count = computed(
        () => `Showing ${this.shown().length} of ${ARTICLES.length} articles.`,
    );

    protected labelOf(value: string): string {
        return TOPICS.find((topic) => topic.value === value)?.label ?? value;
    }

    protected remove(event: ValueChangeEvent<string>): void {
        this.topics.update((topics) =>
            topics.filter((topic) => topic.value !== event.value),
        );
        this.selected.update((selected) =>
            selected.filter((each) => each !== event.value),
        );
    }
}
