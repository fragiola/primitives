import { pagination } from "examples-shared/recipes/pagination";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Pagination } from "../../kit/ui/pagination.tsx";

/** spec/pagination.md, `/pagination/links` */
export function PaginationLinks() {
    const [page, setPage] = useState<number>();
    return (
        <>
            <Pagination.Root
                aria-label="Archive pages"
                total={95}
                pageSize={10}
                siblingCount={2}
                boundaryCount={0}
                onPageChange={(next) => setPage(next)}
            >
                {({ items }) => (
                    <div className={pagination.list}>
                        <Pagination.Previous
                            aria-label="Previous page"
                            nativeButton={false}
                            render={<a href="#previous" />}
                        >
                            ‹
                        </Pagination.Previous>
                        {items.map((item) =>
                            item.type === "page" ? (
                                <Pagination.Item
                                    key={item.value}
                                    value={item.value}
                                    nativeButton={false}
                                    render={<a href={`#page-${item.value}`} />}
                                >
                                    {item.value}
                                </Pagination.Item>
                            ) : (
                                <Pagination.Ellipsis key={item.position}>
                                    …
                                </Pagination.Ellipsis>
                            ),
                        )}
                        <Pagination.Next
                            aria-label="Next page"
                            nativeButton={false}
                            render={<a href="#next" />}
                        >
                            ›
                        </Pagination.Next>
                    </div>
                )}
            </Pagination.Root>
            <Output values={{ page }} />
        </>
    );
}
