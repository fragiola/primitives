import { Separator } from "../../kit/ui/separator.tsx";

export function SeparatorBasic() {
    return (
        <div className="flex w-64 flex-col gap-3 text-sm">
            <p>Account settings</p>
            <Separator />
            <p>Danger zone</p>
            <div className="flex items-center gap-3">
                <a href="#docs">Docs</a>
                <Separator orientation="vertical" />
                <a href="#blog">Blog</a>
            </div>
            <Separator decorative />
        </div>
    );
}
