export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">总收入</h2>
          <p className="text-3xl font-bold text-green-600">¥12,345</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">待处理订单</h2>
          <p className="text-3xl font-bold text-blue-600">23</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">客户总数</h2>
          <p className="text-3xl font-bold text-purple-600">156</p>
        </div>
      </div>
    </div>
  );
}