# Steps

## Purpose

A process in a fixed number of steps (a checkout, an onboarding, a setup wizard): the list of
steps with the current one marked, the content of the current step, Previous and Next controls,
and what shows once every step is done. In a **linear** process a step cannot be skipped: the
user moves past a step only once it is valid.

**Scope: stage 4** (Epic #97, Issue #95). The APG has no stepper pattern and Base UI has no
Steps. Zag/Ark's Steps and Angular CDK's Stepper are the behaviour references (read, never
copied) for the state (a step index, a count, a completed state, linear validation); the
semantics are the APG-closest ones, decided here (D4, the Epic's stop condition) and recorded in
`docs/decisions.md`:

- **A list with `aria-current="step"`**, the value WAI-ARIA defines for "the current step within
  a process", in an ordered list (WAI's multi-page forms tutorial marks a form's steps the same
  way): the List is an `ol`, each Item an `li`, the current one `aria-current="step"`.
- **Triggers are buttons**, each a tab stop (the APG gives arrows only to composite widgets, as
  Pagination decided, Epic #64), `aria-current="step"` on the current step's Trigger too (a
  keyboard user on the button hears it), `aria-controls` its Content.
- **Not a tablist.** The Issue recommended a tablist when the Triggers switch panels and a list
  otherwise. A part cannot know during the server render whether Triggers will render inside the
  List, so the List's role would change at hydration or need an option of its own; the list
  holds both cases with one markup, and no tab semantics are claimed for steps that a linear
  process disables. Recorded as an adjustment of the Issue's option.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Steps.Root | `div` | `steps-root` | holds the step, the count and the validation |
| Steps.List | `ol` | `steps-list` | the steps, in order |
| Steps.Item | `li` | `steps-item` | one step (`index`) |
| Steps.Trigger | `button` | `steps-trigger` | moves to its step |
| Steps.Indicator | `span` | `steps-indicator` | the step's number or check mark, hidden from assistive technology |
| Steps.Separator | `div` | `steps-separator` | the line to the next step, hidden from assistive technology |
| Steps.Content | `div` | `steps-content` | the content of one step (`index`), hidden unless current |
| Steps.PrevTrigger | `button` | `steps-prev-trigger` | the step before |
| Steps.NextTrigger | `button` | `steps-next-trigger` | the step after (past the last: the completed state) |
| Steps.CompletedContent | `div` | `steps-completed-content` | shown once every step is done |

One entry, `/steps` (D8), built on no other component.

## API

**Steps.Root**:

- `step` / `defaultStep` (`0`) / `onStepChange(step, details)`: the current step, from `0`
  (Zag's and CDK's index). `count` means **completed**: every step done, the CompletedContent
  shows. A step outside `[0, count]` is clamped.
- `count` (required): the number of steps.
- `linear` (`false`): a step can only be reached once every step before it is valid; the Next
  trigger needs the current step to be valid.
- `isStepValid(index)` (default: every step is valid): whether a step is valid, read at each
  render (the app's own state; Angular reads it in the root's computed state, so the state it
  reads is signals, as any of a template's). Only `linear` reads it.
- `orientation` (`"horizontal"`): `data-orientation` on the parts; nothing else changes.

**Steps.Item**, **Trigger**, **Indicator**, **Separator**: inside an Item, which takes `index`
(required); its parts read it.

**Steps.Content**: `index` (required).

**Steps.PrevTrigger**, **NextTrigger**, **CompletedContent**: no props of their own.

A press on an enabled Trigger, PrevTrigger or NextTrigger calls `onStepChange` with the step and
the details `{ reason, event }`: `trigger-press`, `previous-press` or `next-press`
(spec/README.md, "Change details"). A Trigger of the current step reports nothing.

**Which steps can be reached.** A step before the current one, and the current one, always. A
later step `i`: always unless `linear`; with `linear`, only when every step before `i` is valid.
The NextTrigger is disabled on the completed state, and with `linear` while the current step is
not valid; the PrevTrigger is disabled on the first step.

## State attributes and ARIA

Every part's state is its step's: `current` (its index is the step), `completed` (its index is
before the step, or the process is completed) or `incomplete` (after it).

| part | attributes |
| --- | --- |
| Root | `data-orientation`; `data-completed` once the process is completed |
| List | `data-orientation` |
| Item | `aria-current="step"` on the current one; `data-current`, `data-completed`, `data-incomplete`; `data-disabled` when its step cannot be reached; `data-orientation` |
| Trigger | `type="button"`; `aria-current="step"` on the current one; `aria-controls` (its Content's `id`); `disabled` when its step cannot be reached; the Item's `data-*` |
| Indicator | `aria-hidden="true"`; the Item's `data-current`, `data-completed`, `data-incomplete` |
| Separator | `aria-hidden="true"`; the Item's `data-current`, `data-completed`, `data-incomplete`; `data-orientation` |
| Content | an `id`; `hidden` unless current; `data-current` |
| PrevTrigger, NextTrigger | `type="button"`; `disabled` (and `data-disabled`) as above |
| CompletedContent | `hidden` unless completed |

No accessible names of their own: the app names the List (`aria-label`) and labels the triggers
with their text.

## Keyboard

The browser's: Tab and Shift+Tab move through the enabled Triggers and the Previous and Next
triggers; Enter or Space presses one. A disabled trigger is out of the tab order (native).

## Focus

A press moves no focus. When the focused trigger becomes disabled (the NextTrigger at the
completed state) the browser's rule applies: the focus goes to the document's body (Pagination's
rule); an app that wants it kept moves it itself.

## Pointer

A click presses a trigger.

## Animation

None: a Content is `hidden` or not.

## RTL

Nothing changes in the DOM; the app's layout follows the direction.

## Scenarios

### `/steps/basic`

A Steps with `count` 3, uncontrolled (`defaultStep` 0): a List `aria-label="Checkout"` of three
Items, each with a Trigger ("Shipping", "Payment", "Review") holding an Indicator (its number) and,
but the last, a Separator; a Content per step ("Shipping address", "Payment method", "Review your
order"), a CompletedContent ("Order placed"), a PrevTrigger "Back" and a NextTrigger "Continue".

Output: `step: <the last onStepChange step>` and `reason: <its reason>` (`none` before any).

Checks:

1. A list "Checkout" of three items; the first item and the "Shipping" button have
   `aria-current="step"`; "Shipping address" shows, the other contents are hidden; "Back" is
   disabled.
2. "Continue": `step: 1`, `reason: next-press`; "Payment" has `aria-current="step"`, "Payment
   method" shows.
3. "Review": `step: 2`, `reason: trigger-press`; "Back": `step: 1`, `reason: previous-press`.
4. "Continue" twice, then once more on "Review": `step: 3`, "Order placed" shows, no step content
   shows, "Continue" is disabled, no item has `aria-current`.
5. The keyboard: Tab moves from "Shipping" to "Payment" to "Review", then to the Next trigger
   (the PrevTrigger is disabled); Enter on "Payment" moves to step 1.
6. Axe finds no violation.

### `/steps/linear`

A Steps with `count` 3, `linear`, uncontrolled: Triggers "Account", "Profile", "Done"; step 0 is
valid once a checkbox "I accept the terms" (in its Content) is checked, step 1 always; a
PrevTrigger "Back" and a NextTrigger "Next".

Output: `step:` and `reason:` as above.

Checks:

1. "Next" and the "Profile" and "Done" buttons are disabled while the box is unchecked.
2. Checking it enables "Next" and "Profile" and "Done"; "Done": `step: 2`.
3. "Account" (a step before): `step: 0`; unchecking the box disables "Profile" and "Done" again.
4. Axe finds no violation.

## Differences from Base UI

Base UI has no Steps; the behaviour above is this library's, decided as the Purpose says.
