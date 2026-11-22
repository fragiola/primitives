import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Avatar } from "../../kit/ui/avatar.tsx";

export function AvatarBasic() {
    const [ada, setAda] = useState<string>();
    const [missing, setMissing] = useState<string>();
    const [again, setAgain] = useState<string[]>([]);
    const [shown, setShown] = useState(false);
    return (
        <>
            <div className="flex items-center gap-4">
                <Avatar.Root>
                    <Avatar.Image
                        src="/avatar/ada.svg"
                        alt="Ada Lovelace"
                        onLoadingStatusChange={setAda}
                    />
                    <Avatar.Fallback>AL</Avatar.Fallback>
                </Avatar.Root>
                <Avatar.Root>
                    <Avatar.Image
                        src="/avatar/missing.svg"
                        alt="Grace Hopper"
                        onLoadingStatusChange={setMissing}
                    />
                    <Avatar.Fallback>GH</Avatar.Fallback>
                </Avatar.Root>
                <Avatar.Root>
                    <Avatar.Fallback delay={300}>KJ</Avatar.Fallback>
                </Avatar.Root>
                {shown && (
                    <Avatar.Root>
                        <Avatar.Image
                            src="/avatar/ada.svg"
                            alt="Ada again"
                            onLoadingStatusChange={(status: string) =>
                                setAgain((current) => [...current, status])
                            }
                        />
                        <Avatar.Fallback>AA</Avatar.Fallback>
                    </Avatar.Root>
                )}
            </div>
            <button
                type="button"
                className="mt-4"
                onClick={() => setShown(true)}
            >
                Show again
            </button>
            <Output
                values={{
                    ada,
                    missing,
                    again: again.length > 0 ? again.join(",") : undefined,
                }}
            />
        </>
    );
}
