import { pagination } from "examples-shared/recipes/pagination";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Pagination } from "../../kit/ui/pagination.tsx";

/** spec/pagination.md, `/pagination/basic` */
export function PaginationBasic() {
    const [page, setPage] = useState(5);
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Pagination.Root
                aria-label="Results pages"
                count={10}
                page={page}
                onPageChange={(next, details) => {
                    setPage(next);
                    setReason(details.reason);
                }}
            >
                {({ items }) => (
                    <div className={pagination.list}>
                        <Pagination.First aria-label="First page">
                            «
                        </Pagination.First>
                        <Pagination.Previous aria-label="Previous page">
                            ‹
                        </Pagination.Previous>
                        {items.map((item) =>
                            item.type === "page" ? (
                                <Pagination.Item
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.value}
                                </Pagination.Item>
                            ) : (
                                <Pagination.Ellipsis key={item.position}>
                                    …
                                </Pagination.Ellipsis>
                            ),
                        )}
                        <Pagination.Next aria-label="Next page">
                            ›
                        </Pagination.Next>
                        <Pagination.Last aria-label="Last page">
                            »
                        </Pagination.Last>
                    </div>
                )}
            </Pagination.Root>
            <Output values={{ page, reason }} />
        </>
    );
}
