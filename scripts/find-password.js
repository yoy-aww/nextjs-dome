const postgres = require('postgres');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testPassword(password, database = 'postgres_test') {
  try {
    const url = `postgresql://postgres:${password}@localhost:5432/${database}`;
    console.log(`🔍 测试密码: ${password ? '***' : '(空密码)'} 数据库: ${database}`);
    
    const sql = postgres(url, { 
      max: 1,
      connect_timeout: 5,
      ssl: false
    });
    
    const result = await sql`SELECT current_user, current_database(), version()`;
    await sql.end();
    
    console.log('✅ 连接成功!');
    console.log(`   用户: ${result[0].current_user}`);
    console.log(`   数据库: ${result[0].current_database}`);
    
    return url;
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔐 PostgreSQL 密码查找工具\n');
  console.log('我们知道你有 postgres_test 数据库，现在找到正确的密码\n');
  
  // 常见密码列表
  const commonPasswords = [
    '', // 空密码
    'postgres',
    '123456',
    'admin',
    'root',
    'password',
    '12345',
    'qwerty',
    'test',
    'postgres123'
  ];
  
  console.log('🔍 测试常见密码...');
  
  for (const password of commonPasswords) {
    const result = await testPassword(password);
    if (result) {
      console.log('\n🎉 找到正确配置!');
      console.log(`\n📝 更新你的 .env.local 文件:`);
      console.log(`POSTGRES_URL="${result}"`);
      
      // 测试是否可以创建nextjs_dashboard数据库
      console.log('\n🔍 检查是否可以创建 nextjs_dashboard 数据库...');
      try {
        const sql = postgres(result, { max: 1, ssl: false });
        await sql`CREATE DATABASE nextjs_dashboard`;
        await sql.end();
        
        const newUrl = result.replace('postgres_test', 'nextjs_dashboard');
        console.log('✅ nextjs_dashboard 数据库创建成功!');
        console.log(`\n推荐配置:`);
        console.log(`POSTGRES_URL="${newUrl}"`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('✅ nextjs_dashboard 数据库已存在!');
          const newUrl = result.replace('postgres_test', 'nextjs_dashboard');
          console.log(`\n推荐配置:`);
          console.log(`POSTGRES_URL="${newUrl}"`);
        } else {
          console.log('⚠️  无法创建 nextjs_dashboard 数据库，使用现有的 postgres_test');
        }
      }
      
      rl.close();
      return;
    }
  }
  
  console.log('\n❌ 常见密码都不对，请手动输入密码');
  
  while (true) {
    const password = await question('\n请输入postgres用户的密码 (直接回车表示空密码): ');
    const result = await testPassword(password);
    
    if (result) {
      console.log('\n🎉 密码正确!');
      console.log(`\n📝 更新你的 .env.local 文件:`);
      console.log(`POSTGRES_URL="${result}"`);
      break;
    }
    
    const retry = await question('\n是否继续尝试? (y/n): ');
    if (retry.toLowerCase() !== 'y') {
      break;
    }
  }
  
  rl.close();
}

main().catch(console.error);