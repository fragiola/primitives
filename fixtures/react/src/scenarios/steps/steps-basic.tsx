import { steps } from "examples-shared/recipes/steps";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Steps } from "../../kit/ui/steps.tsx";

const STEPS = [
    { title: "Shipping", content: "Shipping address" },
    { title: "Payment", content: "Payment method" },
    { title: "Review", content: "Review your order" },
];

/** spec/steps.md, `/steps/basic` */
export function StepsBasic() {
    const [step, setStep] = useState<number>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Steps.Root
                count={STEPS.length}
                onStepChange={(next, details) => {
                    setStep(next);
                    setReason(details.reason);
                }}
            >
                <Steps.List aria-label="Checkout">
                    {STEPS.map((item, index) => (
                        <Steps.Item key={item.title} index={index}>
                            <Steps.Trigger>
                                <Steps.Indicator>{index + 1}</Steps.Indicator>
                                {item.title}
                            </Steps.Trigger>
                            {index < STEPS.length - 1 ? (
                                <Steps.Separator />
                            ) : null}
                        </Steps.Item>
                    ))}
                </Steps.List>
                {STEPS.map((item, index) => (
                    <Steps.Content key={item.title} index={index}>
                        {item.content}
                    </Steps.Content>
                ))}
                <Steps.CompletedContent>Order placed</Steps.CompletedContent>
                <div className={steps.controls}>
                    <Steps.PrevTrigger>Back</Steps.PrevTrigger>
                    <Steps.NextTrigger>Continue</Steps.NextTrigger>
                </div>
            </Steps.Root>
            <Output values={{ step, reason }} />
        </>
    );
}
