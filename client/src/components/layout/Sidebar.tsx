export default function Sidebar() {
  return (
    <div className="w-60 bg-gray-800 h-screen p-4">
      <h2 className="text-xl font-bold mb-4">🚚 Fleet</h2>

      <ul className="space-y-2 text-gray-300">
        <li>Dashboard</li>
        <li>Trips</li>
        <li>Analytics</li>
      </ul>
    </div>
  );
}
