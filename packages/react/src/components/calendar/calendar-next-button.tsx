import type { PartProps } from "../../utils/render-element.tsx";
import {
    CalendarPageButton,
    type CalendarPageButtonState,
} from "./calendar-page-button.tsx";

export interface CalendarNextButtonProps
    extends PartProps<CalendarPageButtonState> {}

/** Shows the next page of months (`visibleMonths` of them); the consumer names it. */
export function CalendarNextButton(props: CalendarNextButtonProps) {
    return <CalendarPageButton delta={1} {...props} />;
}
