# Command

## Purpose

A command palette: a text input that filters a list of actions, always shown, the highlighted
action run by Enter or a press (cmdk's shape; React Aria composes one from its Autocomplete and
Menu, Bits UI and Spartan ship one). It is the APG **combobox with a listbox popup**, the list
always displayed: DOM focus stays in the Input and the highlighted item is announced through
`aria-activedescendant` (APG "Combobox", "list autocomplete with automatic selection"). Base UI
1.9 has no Command; where the APG says nothing, the choices below take the APG-closest option
(cmdk, React Aria and Bits read for the behaviour, never copied, D4/D9).

- **Items are actions**, not values: an Item's `onSelect` runs it. Nothing is selected and the
  Command has no form value (no Field, no hidden input).
- **Built-in filtering** with a scorer: each Item is scored against the typed text (substring
  and word prefix by default, its `keywords` too); a non-matching Item hides, a Group with no
  shown Item hides, and the best-scoring Item is highlighted. `filter` replaces the scorer, or
  `null` turns filtering off (async results, filtered by the app).
- **Pages**: a stack of nested pages (`pages`); Backspace on an empty Input goes back.
- **Opt-in parts in their own entries** (D8): the virtual list is `/command-virtual` (on the
  toolkit's `/virtual`), so `/command` never bundles it; async results come from each
  framework's `useAsyncList` (`/async-list`), with the Root's `loading` and the Loading part.

Out of scope: sorting the Items by their score (below), Vim keys (Ctrl+N / Ctrl+P / Ctrl+J /
Ctrl+K), a controlled highlight, a dialog part (the Command dialog is a composition, below), a
global shortcut manager, virtual groups.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `command-root` | holds the state: the text, the highlight, the pages |
| Input | `input` | `command-input` | the `combobox`; keeps DOM focus |
| List | `div` | `command-list` | the `listbox`, always displayed |
| Group | `div` | `command-group` | a `group` of items; `hidden` while it shows no item |
| GroupLabel | `div` | `command-group-label` | names its Group |
| Separator | `div` | `command-separator` | between groups; `hidden` while there is text, unless `forceMount` |
| Item | `div` | `command-item` | an `option`: an action; `hidden` while it does not match |
| Empty | `div` | `command-empty` | a polite live region; its children rendered only while no item is shown |
| Loading | `div` | `command-loading` | a polite live region; its children rendered only while `loading` |

Empty and Loading sit outside the List (a `listbox` owns only options and groups), anywhere in
the Root.

## API

**Root**:

- `inputValue`, `defaultInputValue` (`""`), `onInputValueChange(value, details)`: the text.
  Reasons: `input-change` (typing), `page-change` (the page changed: the text is emptied).
- `filter(value, search, keywords) => number` (default: the toolkit's `commandScore`): an Item's
  score for the text, trimmed; `0` hides it. `null` turns filtering off: every Item shows (the
  app filters, as with async results).
- `pages`, `defaultPages` (`[]`), `onPagesChange(pages, details)`: the stack of page keys, the
  last the current page; the app renders the current page's Items. Reason: `backspace-key`
  (Backspace on an empty Input removed the last page). An app pushes a page by setting `pages`
  (an Item's `onSelect`).
- `loading` (`false`): results are loading: the List's `aria-busy`, the Loading part's children,
  and the Empty part's children are not rendered.
- `loopFocus` (`true`): the arrow keys wrap from one end to the other (the library's
  composites).

**Item**:

- `value` (string, required): the text the filter scores, and the Item's identity (unique in the
  Command).
- `keywords` (strings, default none): more texts the filter scores (aliases).
- `disabled`: highlighted by the arrows, never run, never highlighted by the filter.
- `forceMount`: always shown, whatever the text (an "Ask…" action); its score is `1`.
- `onSelect(value, event)` (Vue `@select`, Angular `(itemSelect)`): runs the action, on Enter or
  a press.

**Separator**: `forceMount` (shown while there is text too).

**Input**, **List**, **Group**, **GroupLabel**, **Empty**, **Loading**: no props of their own.

### The scorer (`@fragiola/primitives/command`)

`commandScore(value, search, keywords)` compares case- and accent-insensitively (`NFD`, marks
removed, lower case) and returns the best of the value's score and each keyword's score times
`0.95` (a keyword match ranks just under the same match on the value):

| match | score |
| --- | --- |
| no text | `1` |
| the whole text | `1` |
| the text starts with the search | `0.9` |
| a word of the text starts with the search (words split at spaces and `-_/.:`) | `0.8` |
| every word of the search starts a word of the text, in order ("git co" in "Git checkout") | `0.7` |
| the text contains the search | `0.6` |
| none | `0` |

The toolkit's entry also holds `commandMatches(entries, search, filter)` (the matching entries
of a list and their scores, for the virtual list) and `bestMatch(scores, disabled)` (the index
of the best-scoring enabled entry, the first among equals).

**Why no sorting**: the Items keep their order, and the score decides which matches and which
is highlighted (the best one). Sorting would reorder the consumer's elements in every framework
(cmdk moves DOM nodes React does not know about), and group order stays meaningful; the
highlight on the best match is what a sorted list gives the keyboard.

### Pages

The current page is the last key of `pages` (none: the root page). When it changes (an app
pushing a page, Backspace popping one), the Root empties the text (`page-change`) and highlights
the first enabled Item of the new page. Backspace on an empty Input with at least one page
removes the last (`backspace-key`) and is not typed; on the root page it does nothing.

### The Command dialog

Not a component: a Command inside the library's Dialog, opened by the app's own global shortcut
(Cmd/Ctrl+K) and by a Trigger. The Dialog gives everything a palette needs (the modal layer,
the focus trap, Escape, the focus return), and the Input is its first tabbable element, so it
takes the focus on open. A `CommandDialog` part would only re-export Dialog's and bundle it
into every Command app; a global shortcut belongs to the app (Epic #104, out of scope). The
`/command/dialog` scenario is the documented composition.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Input | `role="combobox"`, `aria-expanded="true"` (the list is always displayed), `aria-controls` (the List's id), `aria-autocomplete="list"`, `aria-activedescendant` (the highlighted item's id, only while one is highlighted), `autocomplete="off"`, `spellcheck="false"`, `type="text"` |
| List | `role="listbox"`, an `id`, `tabindex="-1"` (a scrolling list is no Tab stop of its own: Chromium makes a scroll container with no focusable child one, and the Input keeps the focus), `data-empty` while no item is shown (once mounted), `aria-busy="true"` and `data-loading` while `loading` |
| Group | `role="group"`, `aria-labelledby` (its GroupLabel), `hidden` while it shows no item |
| GroupLabel | an `id` |
| Separator | `role="presentation"`, `data-orientation="horizontal"`, `hidden` while there is text (unless `forceMount`) |
| Item | `role="option"`, an `id`, `aria-selected="true"` and `data-highlighted` while highlighted (else `aria-selected="false"`), `aria-disabled="true"` and `data-disabled` when disabled, `hidden` while it does not match |
| Empty, Loading | `role="status"`, `aria-live="polite"`, `aria-atomic="true"` |

`aria-selected` follows the highlight: the APG's "list autocomplete with automatic selection"
marks the option `aria-activedescendant` points to as selected, and an action list has no other
selection. A hidden part carries the `hidden` attribute: the app's CSS must not override it (a
`display` rule on the same element beats the browser's `[hidden]`; Tailwind's preflight keeps
it). The Input's accessible name comes from the consumer (`aria-label`, `<label for>`).

## Keyboard

DOM focus **stays on the Input**.

| key | action |
| --- | --- |
| typing | changes the text (`input-change`), filters, and highlights the best-scoring enabled Item (none when none matches) |
| ArrowDown / ArrowUp | the next / previous shown Item (disabled ones included); wraps with `loopFocus` |
| Home / End | the first / last shown Item (the Issue, cmdk and Bits: the list is the palette's content; the APG lets Home and End move either the caret or the focus; Shift+Home / Shift+End stay native) |
| Enter | runs the highlighted enabled Item's `onSelect` (the default prevented); a disabled one does nothing |
| Backspace | on an empty Input with a page: back to the previous page (`backspace-key`) |
| Escape | nothing of the Command's own: inside a Dialog, it closes the dialog |

The highlight is set again when the shown Items change: typing highlights the best match; a
highlighted Item that is gone (async results, a page change) gives the highlight to the first
enabled shown Item. Keys pressed during an IME composition are ignored.

## Pointer

- Moving the pointer over an Item highlights it.
- A click on an enabled Item runs it (`onSelect`); a press never takes the focus from the Input.

## Forms

None: a Command is not a form control. Its Input has no `name` and is not a Field control.

## RTL

The list follows the document's direction; no key changes.

## Virtual list (`/command-virtual`)

`CommandVirtual.List` is the List rendering only the shown Items in view, for long lists (D8: the
toolkit's `/virtual` is in this entry only), with the props of [virtual-lists.md](virtual-lists.md#api)
(`itemSize`, `measure`, `overscan`, `loading`, `onLoadMore`) and:

- `items`: the entries, `{ value, keywords?, disabled? }` (more fields allowed); the List filters
  them with the Root's text and `filter` (`commandMatches`).
- `children(entry, index)`: a `Command.Item` for an entry (Vue: the default scoped slot; Angular:
  `@for` over the part's `rows()` with `[commandVirtualRow]`, as the other virtual lists).

The ends, the highlighted Item with its neighbours and the best match stay rendered, so the keys
and the highlight work as with every Item rendered; each row carries `aria-setsize` and
`aria-posinset`. No groups (as every virtual list, [virtual-lists.md](virtual-lists.md#out-of-scope)).
The entry re-exports `Command`, so an app imports both from it.

## Server rendering

The Items render with their `hidden` state on the server (the text is known); the highlight and
`data-empty` are set once mounted, so the server render highlights nothing and the Empty part's
children are not rendered before hydration.

## Scenarios

The items of most scenarios, in two Groups: **"Suggestions"** ("Calendar", "Search Emoji",
"Calculator" disabled) and **"Settings"** ("Profile" with keyword "account", "Billing",
"Archive"), a Separator between the groups. A press or Enter on an Item writes `ran: <value>`.

### `/command/basic`

A Root; an Input named **"Command"** (`aria-label`); an Empty **"No results."**; a List holding
the two Groups (GroupLabels "Suggestions" and "Settings"). After the Root, a button **"After"**.
Output: `ran: ...`, `search: ...`.

Checks:

1. A `combobox` named "Command", `aria-expanded="true"`, `aria-controls` the `listbox`;
   six options; "Calendar" highlighted once mounted (`aria-activedescendant`,
   `aria-selected="true"`).
2. ArrowDown highlights "Search Emoji", ArrowDown "Calculator" (disabled, `aria-disabled`);
   Enter runs nothing; End "Archive"; ArrowDown wraps to "Calendar"; ArrowUp wraps to "Archive";
   Home "Calendar".
3. Enter runs "Calendar" (`ran: Calendar`); the focus stays in the Input.
4. Type `emo`: only "Search Emoji" shows (a word prefix) and is highlighted; the "Settings"
   group is `hidden`; the Separator is `hidden`; `search: emo`.
5. Type `acc` (after clearing): "Profile" shows (its keyword).
6. Type `ar`: "Calendar", "Search Emoji" (substrings) and "Archive" (a prefix, the best score):
   "Archive" is highlighted.
7. Type `zzz`: no option shows, "No results." is rendered, the List has `data-empty`; Enter runs
   nothing.
8. Clearing the text shows every option again and the Separator; the Empty part has no text.
9. Hovering "Billing" highlights it; a click runs it (`ran: Billing`) and the focus stays in the
   Input; a click on "Calculator" runs nothing.
10. Tab moves the focus to "After".
11. Axe finds no violation, with text and with no result.

### `/command/filter`

The items with `filter` the app's (a value or keyword **starting** with the text, case ignored,
score `1`), and an Item **"Ask AI"** with `forceMount` at the end of the List. Output: `ran: ...`.

Checks:

1. Type `ar`: only "Archive" and "Ask AI" show; "Archive" highlighted.
2. Type `x`: only "Ask AI" shows (forced); the Empty part has no text; Enter runs it
   (`ran: Ask AI`).

### `/command/pages`

A Command with controlled `pages`. The root page: "Search projects…" (pushes `projects`) and
"Change theme…" (pushes `theme`). The `projects` page: "Primitives", "Tree", "Splitter"; the
`theme` page: "Light", "Dark". Output: `pages: ...` (joined with `/`), `ran: ...`,
`reason: ...` (the last pages change).

Checks:

1. Type `proj`, Enter: `pages: projects`, the text is emptied, "Primitives" highlighted.
2. Type `tr`: "Tree" only. Backspace twice empties the text and stays on the page; Backspace
   again: `pages:` empty, `reason: backspace-key`, the root page's items with "Search projects…"
   highlighted.
3. Backspace on the root page's empty Input does nothing.
4. Axe finds no violation on a page.

### `/command/async`

A Command with `filter={null}` whose Items come from `useAsyncList` over the async loader of
[virtual-lists.md](virtual-lists.md#scenarios) (its labels, 50 per page), the text sent as the
filter text, `loading` the list's, a Loading **"Loading…"** and an Empty **"No results."**.
Output: `count: ...`, `filter: ...`.

Checks:

1. While the first page loads, the List has `aria-busy="true"` and "Loading…" is rendered; then
   50 options, the first highlighted, no "Loading…".
2. Type `777`: once settled, only options containing `777` show (`filter: 777`) and the first is
   highlighted.
3. Type `xyz`: once settled, "No results." (not while loading).
4. Axe finds no violation.

### `/command/dialog`

A Dialog with a Trigger **"Open command menu"**; its Popup (named "Command menu") holds the
basic Command. A document `keydown` listener toggles the Dialog on Ctrl+K or Meta+K (the default
prevented). An Item's `onSelect` writes `ran:` and closes the Dialog. Output: `ran: ...`,
`open: ...`.

Checks:

1. With the focus on "Open command menu", Ctrl+K opens the Dialog with the focus in the Input;
   Escape closes it and the focus returns to "Open command menu".
2. Meta+K opens it; type `bill`, Enter: `ran: Billing`, the Dialog closes and the focus returns
   to where it was.
3. A click on "Open command menu" opens it; Ctrl+K closes it.
4. Axe finds no violation while open.

### `/command-virtual/basic`

A Command whose CommandVirtual List holds the 10 000 items of
[virtual-lists.md](virtual-lists.md#scenarios) (each Item's `value` the label, item 3
disabled), an Input named **"Command"**. Output: `ran: ...`.

Checks:

1. Fewer than 60 options are rendered, each with `aria-setsize="10000"`; "Item 1" highlighted.
2. End highlights "Item 10000" (`aria-posinset="10000"`), in view; Enter runs it.
3. Type `zulu`: "Zulu" alone, highlighted (`aria-setsize="1"`); Enter: `ran: Zulu`.
4. Type `Item 99`: "Item 99" is highlighted (the text, the best score), not "Item 990".
5. Axe finds no violation.

## Differences from Base UI

Base UI (1.9) has no Command. Differences from cmdk, the closest reference: the Items keep their
order (no sorting by score, above); an Item's `value` is required (no reading of its text
content: a server render and three frameworks need the same value); disabled Items can be
highlighted by the arrows (the library's Combobox and Autocomplete rule) but never run; Home and
End move the highlight; no Vim keys; no `Command.Dialog` part.
