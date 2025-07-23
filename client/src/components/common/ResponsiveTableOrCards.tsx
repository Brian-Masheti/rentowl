import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface ResponsiveTableOrCardsProps<T> {
  columns: Column<T>[];
  data: T[];
  cardTitle?: (row: T) => React.ReactNode;
  cardContent?: (row: T) => React.ReactNode;
  keyField: keyof T | string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

function ResponsiveTableOrCards<T extends { [key: string]: any }>({
  columns,
  data,
  cardTitle,
  cardContent,
  keyField,
}: ResponsiveTableOrCardsProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {data.map((row) => (
          <div
            key={row[keyField] as React.Key}
            className="bg-white/90 border border-[#FFA673]/20 rounded-2xl p-4 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            {cardTitle && <div className="font-bold text-[#03A6A1] text-lg mb-2">{cardTitle(row)}</div>}
            {cardContent ? (
              cardContent(row)
            ) : (
              <ul className="text-sm text-gray-700">
                {columns.map((col) => (
                  <li key={col.key} className="mb-1">
                    <span className="font-semibold text-[#FFA673]">{col.label}: </span>
                    {col.render ? col.render(row) : row[col.key]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-[#FFA673]/20 rounded-2xl bg-white/90 shadow-lg">
        <thead>
          <tr className="bg-[#FFF8F0] text-[#03A6A1]">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left font-bold text-base">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] as React.Key}
              className={
                `transition-colors duration-200 ${rowIdx % 2 === 0 ? 'bg-[#FFF8F0]' : ''} hover:bg-[#FFE3BB]/60`
              }
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-gray-700 text-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResponsiveTableOrCards;
