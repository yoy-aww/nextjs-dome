const fs = require('fs');
const path = require('path');

// 检查环境变量
function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 文件不存在');
    console.log('请先创建 .env.local 文件并配置数据库连接信息');
    process.exit(1);
  }
  console.log('✅ 找到 .env.local 文件');
}

// 测试数据库连接
async function testConnection() {
  try {
    // 加载环境变量
    require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL 环境变量未设置');
    }

    // 直接使用postgres库测试连接
    const postgres = require('postgres');
    const sql = postgres(process.env.POSTGRES_URL, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      max: 1, // 只用一个连接测试
    });

    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    await sql.end();

    console.log('✅ 数据库连接成功');
    console.log('   时间:', result[0].current_time);
    console.log('   版本:', result[0].db_version.split(' ')[0]);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n请检查以下配置:');
    console.log('1. PostgreSQL 服务是否运行');
    console.log('2. .env.local 中的 POSTGRES_URL 是否正确');
    console.log('3. 数据库是否存在');
    return false;
  }
}

// 显示下一步操作
function showNextSteps() {
  console.log('\n📋 下一步操作:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 初始化数据库: 访问 http://localhost:3000/seed');
  console.log('3. 查看应用: 访问 http://localhost:3000/dashboard');
}

// 主函数
async function main() {
  console.log('🚀 开始设置数据库...\n');

  checkEnvFile();
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('\n❌ 数据库设置失败');
    process.exit(1);
  }

  console.log('\n✅ 数据库连接配置正确!');
  showNextSteps();
}

// 安装依赖检查
function checkDependencies() {
  try {
    require('postgres');
    require('dotenv');
  } catch (error) {
    console.error('❌ 缺少依赖包，正在安装...');
    const { execSync } = require('child_process');
    execSync('npm install dotenv', { stdio: 'inherit' });
  }
}

checkDependencies();
main().catch(console.error);
