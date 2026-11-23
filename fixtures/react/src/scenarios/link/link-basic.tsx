import { link } from "examples-shared/recipes/link";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Link } from "../../kit/ui/link.tsx";

/** spec/link.md, `/link/basic` */
export function LinkBasic() {
    const [clicks, setClicks] = useState(0);
    const count = () => setClicks((current) => current + 1);
    return (
        <>
            <div className={link.list}>
                <Link href="#home" current onClick={count}>
                    Home
                </Link>
                <Link href="#docs" onClick={count}>
                    Docs
                </Link>
                <Link href="#archive" disabled onClick={count}>
                    Archive
                </Link>
            </div>
            <Output values={{ clicks }} />
        </>
    );
}
