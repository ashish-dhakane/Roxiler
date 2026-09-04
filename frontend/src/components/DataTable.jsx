import { useState } from 'react';

export default function DataTable({ columns, data, onSort, sortBy, sortOrder }) {
  const handleSort = (field) => {
    if (!onSort) return;
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No records found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => col.sortable !== false && handleSort(col.field)}
                className={col.sortable !== false ? 'sortable' : ''}
              >
                {col.header}
                {col.sortable !== false && (
                  <span className={`sort-icon ${sortBy === col.field ? 'active' : ''}`}>
                    {getSortIcon(col.field)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.field}>
                  {col.render ? col.render(row[col.field], row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
