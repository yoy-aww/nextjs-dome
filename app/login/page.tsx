import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/acme-logo';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-8">
            <AcmeLogo />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
            登录到您的账户
          </h1>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入您的邮箱"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入您的密码"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  记住我
                </label>
              </div>
              
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-500">
                忘记密码？
              </Link>
            </div>
            
            <Link
              href="/dashboard"
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录 <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-500">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}