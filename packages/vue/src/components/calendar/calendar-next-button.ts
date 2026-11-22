import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type CalendarPageButtonState,
    definePageButton,
} from "./calendar-page-button.ts";

export type CalendarNextButtonProps = Record<never, never>;

/** Shows the next page of months (`visibleMonths` of them); the consumer names it. */
export const CalendarNextButton: PartComponent<
    CalendarNextButtonProps,
    CalendarPageButtonState
> = publicComponent(definePageButton("CalendarNextButton", 1));
