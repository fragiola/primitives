import { Pagination } from "@fragiola/primitives-react/pagination";
import { useState } from "react";
import { styles } from "./styles.ts";

const PAGE_SIZE = 5;
const ORDERS = Array.from({ length: 42 }, (_, index) => ({
    id: 1001 + index,
    total: ((index * 37) % 90) + 10,
}));

// A results table shown five rows at a time, and its pager (spec/pagination.md): the app holds
// the page and renders that page's rows; the Pagination renders the range.
export default function ResultsPager() {
    const [page, setPage] = useState(1);
    const rows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (
        <div className={styles.stack}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.cell}>Order</th>
                        <th className={styles.number}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((order) => (
                        <tr key={order.id}>
                            <td className={styles.cell}>#{order.id}</td>
                            <td className={styles.number}>${order.total}.00</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination.Root
                aria-label="Orders pages"
                total={ORDERS.length}
                pageSize={PAGE_SIZE}
                page={page}
                onPageChange={setPage}
                className={styles.root}
            >
                {({ items }) => (
                    <div className={styles.list}>
                        <Pagination.Previous
                            aria-label="Previous page"
                            className={styles.control}
                        >
                            ‹
                        </Pagination.Previous>
                        {items.map((item) =>
                            item.type === "page" ? (
                                <Pagination.Item
                                    key={item.value}
                                    value={item.value}
                                    className={styles.item}
                                >
                                    {item.value}
                                </Pagination.Item>
                            ) : (
                                <Pagination.Ellipsis
                                    key={item.position}
                                    className={styles.ellipsis}
                                >
                                    …
                                </Pagination.Ellipsis>
                            ),
                        )}
                        <Pagination.Next
                            aria-label="Next page"
                            className={styles.control}
                        >
                            ›
                        </Pagination.Next>
                    </div>
                )}
            </Pagination.Root>
        </div>
    );
}
