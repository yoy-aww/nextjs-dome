import { DocumentTextIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const invoices = [
  { 
    id: 'INV-001', 
    customer: '张三', 
    amount: 1250.00, 
    status: '已付款', 
    date: '2024-01-15',
    dueDate: '2024-02-15'
  },
  { 
    id: 'INV-002', 
    customer: '李四', 
    amount: 850.00, 
    status: '待付款', 
    date: '2024-01-20',
    dueDate: '2024-02-20'
  },
  { 
    id: 'INV-003', 
    customer: '王五', 
    amount: 2100.00, 
    status: '已付款', 
    date: '2024-01-25',
    dueDate: '2024-02-25'
  },
  { 
    id: 'INV-004', 
    customer: '赵六', 
    amount: 750.00, 
    status: '逾期', 
    date: '2024-01-10',
    dueDate: '2024-02-10'
  },
];

export default function InvoicesPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '已付款':
        return 'bg-green-100 text-green-800';
      case '待付款':
        return 'bg-yellow-100 text-yellow-800';
      case '逾期':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">发票管理</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          创建发票
        </button>
      </div>

      <div className="mb-4 flex space-x-4">
        <select className="border border-gray-300 rounded-lg px-3 py-2">
          <option>所有状态</option>
          <option>已付款</option>
          <option>待付款</option>
          <option>逾期</option>
        </select>
        <input 
          type="text" 
          placeholder="搜索发票..." 
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                发票号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">¥{invoice.amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.date}</div>
                  <div className="text-sm text-gray-500">到期: {invoice.dueDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}