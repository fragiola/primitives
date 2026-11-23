import { steps } from "examples-shared/recipes/steps";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Steps } from "../../kit/ui/steps.tsx";

const STEPS = ["Account", "Profile", "Done"];

/** spec/steps.md, `/steps/linear` */
export function StepsLinear() {
    const [accepted, setAccepted] = useState(false);
    const [step, setStep] = useState<number>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Steps.Root
                count={STEPS.length}
                linear
                isStepValid={(index) => index !== 0 || accepted}
                onStepChange={(next, details) => {
                    setStep(next);
                    setReason(details.reason);
                }}
            >
                <Steps.List aria-label="Sign up">
                    {STEPS.map((title, index) => (
                        <Steps.Item key={title} index={index}>
                            <Steps.Trigger>
                                <Steps.Indicator>{index + 1}</Steps.Indicator>
                                {title}
                            </Steps.Trigger>
                            {index < STEPS.length - 1 ? (
                                <Steps.Separator />
                            ) : null}
                        </Steps.Item>
                    ))}
                </Steps.List>
                <Steps.Content index={0}>
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(event) =>
                                setAccepted(event.target.checked)
                            }
                        />
                        I accept the terms
                    </label>
                </Steps.Content>
                <Steps.Content index={1}>Your profile</Steps.Content>
                <Steps.Content index={2}>All set</Steps.Content>
                <div className={steps.controls}>
                    <Steps.PrevTrigger>Back</Steps.PrevTrigger>
                    <Steps.NextTrigger>Next</Steps.NextTrigger>
                </div>
            </Steps.Root>
            <Output values={{ step, reason }} />
        </>
    );
}
