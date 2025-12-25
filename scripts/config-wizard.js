const fs = require('fs');
const path = require('path');
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

async function testConnection(url) {
  try {
    const postgres = require('postgres');
    const sql = postgres(url, { max: 1 });
    await sql`SELECT 1`;
    await sql.end();
    return true;
  } catch (error) {
    console.log('连接失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 PostgreSQL 配置向导\n');
  
  console.log('常见的PostgreSQL默认配置:');
  console.log('1. 用户名: postgres, 密码: postgres');
  console.log('2. 用户名: postgres, 密码: (空)');
  console.log('3. 用户名: postgres, 密码: 123456');
  console.log('4. 自定义配置\n');
  
  const choice = await question('请选择配置 (1-4): ');
  
  let configs = [];
  
  switch(choice) {
    case '1':
      configs = [
        'postgresql://postgres:postgres@localhost:5432/nextjs_dashboard',
        'postgresql://postgres:postgres@localhost:5432/postgres'
      ];
      break;
    case '2':
      configs = [
        'postgresql://postgres@localhost:5432/nextjs_dashboard',
        'postgresql://postgres@localhost:5432/postgres'
      ];
      break;
    case '3':
      configs = [
        'postgresql://postgres:123456@localhost:5432/nextjs_dashboard',
        'postgresql://postgres:123456@localhost:5432/postgres'
      ];
      break;
    case '4':
      const username = await question('用户名: ');
      const password = await question('密码: ');
      const database = await question('数据库名 (默认: nextjs_dashboard): ') || 'nextjs_dashboard';
      configs = [`postgresql://${username}:${password}@localhost:5432/${database}`];
      break;
    default:
      console.log('无效选择');
      process.exit(1);
  }
  
  console.log('\n🔍 测试连接...');
  
  for (const config of configs) {
    console.log(`测试: ${config.replace(/:([^:@]+)@/, ':***@')}`);
    if (await testConnection(config)) {
      console.log('✅ 连接成功!');
      
      // 更新 .env.local
      const envPath = path.join(__dirname, '../.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      envContent = envContent.replace(
        /POSTGRES_URL="[^"]*"/,
        `POSTGRES_URL="${config}"`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local 已更新');
      
      rl.close();
      return;
    }
  }
  
  console.log('❌ 所有配置都连接失败');
  console.log('\n请检查:');
  console.log('1. PostgreSQL 服务是否运行');
  console.log('2. 用户名和密码是否正确');
  console.log('3. 数据库是否存在');
  
  rl.close();
}

main().catch(console.error);