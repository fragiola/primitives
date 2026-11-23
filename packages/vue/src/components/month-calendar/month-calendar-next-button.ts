import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    defineMonthPageButton,
    type MonthCalendarPageButtonState,
} from "./month-calendar-page-button.ts";

export type MonthCalendarNextButtonProps = Record<never, never>;

/** Shows the next page (a year; 12 years); the consumer names it. */
export const MonthCalendarNextButton: PartComponent<
    MonthCalendarNextButtonProps,
    MonthCalendarPageButtonState
> = publicComponent(defineMonthPageButton("MonthCalendarNextButton", 1));
