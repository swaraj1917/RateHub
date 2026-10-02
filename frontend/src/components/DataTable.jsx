import { useMemo, useState } from "react";

function compare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
}

/**
 * Sortable table. Columns: { key, label, sortable, render?(row), value?(row), className? }
 * Sorting runs on the client, so any column (including calculated ones like rating) can be sorted.
 * On phones the table collapses into stacked cards (see index.css) and a sort dropdown appears.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = "id",
  initialSort,
  emptyTitle = "Nothing here yet",
  emptyText = "",
}) {
  const [sort, setSort] = useState(
    initialSort || { key: columns.find((c) => c.sortable)?.key, order: "asc" }
  );

  const sortedRows = useMemo(() => {
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;

    const read = column.value || ((row) => row[column.key]);
    const direction = sort.order === "asc" ? 1 : -1;

    return [...rows].sort((a, b) => direction * compare(read(a), read(b)));
  }, [rows, columns, sort]);

  function toggle(key) {
    setSort((current) =>
      current.key === key
        ? { key, order: current.order === "asc" ? "desc" : "asc" }
        : { key, order: "asc" }
    );
  }

  if (rows.length === 0) {
    return (
      <div className="empty">
        <strong>{emptyTitle}</strong>
        {emptyText}
      </div>
    );
  }

  const sortable = columns.filter((c) => c.sortable);

  return (
    <>
      <div className="mobile-sort field">
        <label htmlFor="mobile-sort-select">Sort by</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            id="mobile-sort-select"
            className="select"
            value={sort.key}
            onChange={(e) => setSort({ key: e.target.value, order: "asc" })}
          >
            {sortable.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => toggle(sort.key)}
            aria-label="Toggle sort direction"
          >
            {sort.order === "asc" ? "A-Z" : "Z-A"}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active ? (sort.order === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {column.sortable ? (
                      <button type="button" className="sort-btn" onClick={() => toggle(column.key)}>
                        {column.label}
                        <span className="sort-arrow" aria-hidden="true">
                          <i className={`up${active && sort.order === "asc" ? " active" : ""}`} />
                          <i className={`down${active && sort.order === "desc" ? " active" : ""}`} />
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.label} className={column.className}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
