import type { PartProps } from "../../utils/render-element.tsx";
import {
    MonthCalendarPageButton,
    type MonthCalendarPageButtonState,
} from "./month-calendar-page-button.tsx";

export interface MonthCalendarNextButtonProps
    extends PartProps<MonthCalendarPageButtonState> {}

/** Shows the next page (a year; 12 years); the consumer names it. */
export function MonthCalendarNextButton(props: MonthCalendarNextButtonProps) {
    return <MonthCalendarPageButton delta={1} {...props} />;
}
