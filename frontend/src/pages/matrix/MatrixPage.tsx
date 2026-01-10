const MatrixPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Matrix View</h1>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 p-2">ID</th>
            <th className="border border-slate-300 p-2">Name</th>
            <th className="border border-slate-300 p-2">Status</th>
            <th className="border border-slate-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="border border-slate-300 p-2">{i}</td>
              <td className="border border-slate-300 p-2">Item {i}</td>
              <td className="border border-slate-300 p-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  Active
                </span>
              </td>
              <td className="border border-slate-300 p-2">${i * 100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default MatrixPage