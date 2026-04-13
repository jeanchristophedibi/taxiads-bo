export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-4 w-72 rounded" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-100">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-5 py-3">
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="skeleton h-10 w-full max-w-xs rounded-apple" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-7 w-20 rounded-apple" />
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="tbl-head">
                <th className="w-10" />
                <th>Élément</th>
                <th>Détail</th>
                <th>Statut</th>
                <th>Mise à jour</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-100/80">
                  <td className="px-4 py-4"><div className="w-4 h-4 skeleton rounded" /></td>
                  {[160, 120, 96, 110, 80].map((width, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4">
                      <div className="skeleton h-3.5 rounded" style={{ width }} />
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="skeleton h-8 w-8 rounded-apple" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
