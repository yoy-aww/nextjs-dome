const postgres = require('postgres');

// 扩展的配置测试，包括不同的数据库名
const configs = [
  // 测试postgres_test数据库
  {
    name: 'postgres_test数据库，无密码',
    url: 'postgresql://postgres@localhost:5432/postgres_test'
  },
  {
    name: 'postgres_test数据库，密码postgres',
    url: 'postgresql://postgres:postgres@localhost:5432/postgres_test'
  },
  {
    name: 'postgres_test数据库，密码123456',
    url: 'postgresql://postgres:123456@localhost:5432/postgres_test'
  },
  {
    name: 'postgres_test数据库，密码admin',
    url: 'postgresql://postgres:admin@localhost:5432/postgres_test'
  },
  {
    name: 'postgres_test数据库，密码root',
    url: 'postgresql://postgres:root@localhost:5432/postgres_test'
  },
  // 测试默认postgres数据库
  {
    name: '默认postgres数据库，无密码',
    url: 'postgresql://postgres@localhost:5432/postgres'
  },
  {
    name: '默认postgres数据库，密码postgres',
    url: 'postgresql://postgres:postgres@localhost:5432/postgres'
  },
  // 测试其他可能的用户名
  {
    name: '用户名Administrator，无密码',
    url: 'postgresql://Administrator@localhost:5432/postgres_test'
  },
  {
    name: '用户名sa，密码sa',
    url: 'postgresql://sa:sa@localhost:5432/postgres_test'
  }
];

async function testConnection(config) {
  try {
    console.log(`\n🔍 测试: ${config.name}`);
    console.log(`   URL: ${config.url.replace(/:([^:@]+)@/, ':***@')}`);
    
    const sql = postgres(config.url, { 
      max: 1,
      connect_timeout: 10,
      ssl: false,
      debug: false
    });
    
    const result = await sql`
      SELECT 
        current_user as username,
        current_database() as database,
        version() as version,
        NOW() as current_time
    `;
    
    await sql.end();
    
    console.log('   ✅ 连接成功!');
    console.log(`   用户: ${result[0].username}`);
    console.log(`   数据库: ${result[0].database}`);
    console.log(`   版本: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
    
    return config;
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    
    // 分析错误类型
    if (error.message.includes('password authentication failed')) {
      console.log('   💡 提示: 密码认证失败，尝试其他密码');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('   💡 提示: 数据库不存在');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.log('   💡 提示: 用户不存在');
    } else if (error.message.includes('connection refused')) {
      console.log('   💡 提示: 连接被拒绝，检查服务是否运行');
    }
    
    return null;
  }
}

async function listDatabases(config) {
  try {
    const sql = postgres(config.url, { max: 1, ssl: false });
    const databases = await sql`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `;
    await sql.end();
    
    console.log('\n📋 可用数据库:');
    databases.forEach(db => {
      console.log(`   - ${db.datname}`);
    });
    
    return databases.map(db => db.datname);
  } catch (error) {
    console.log('❌ 无法获取数据库列表:', error.message);
    return [];
  }
}

async function listUsers(config) {
  try {
    const sql = postgres(config.url, { max: 1, ssl: false });
    const users = await sql`
      SELECT usename as username, usesuper as is_superuser 
      FROM pg_user 
      ORDER BY usename
    `;
    await sql.end();
    
    console.log('\n👥 可用用户:');
    users.forEach(user => {
      console.log(`   - ${user.username} ${user.is_superuser ? '(超级用户)' : ''}`);
    });
    
    return users;
  } catch (error) {
    console.log('❌ 无法获取用户列表:', error.message);
    return [];
  }
}

async function main() {
  console.log('🔍 PostgreSQL 详细诊断\n');
  console.log('正在测试各种配置组合...');
  
  let workingConfig = null;
  
  for (const config of configs) {
    const result = await testConnection(config);
    if (result) {
      workingConfig = result;
      break;
    }
  }
  
  if (workingConfig) {
    console.log('\n🎉 找到可用配置!');
    
    // 获取详细信息
    await listDatabases(workingConfig);
    await listUsers(workingConfig);
    
    // 生成建议配置
    console.log('\n📝 建议的 .env.local 配置:');
    console.log(`POSTGRES_URL="${workingConfig.url}"`);
    
    // 如果使用的是postgres_test，建议创建nextjs_dashboard
    if (workingConfig.url.includes('postgres_test')) {
      const nextjsUrl = workingConfig.url.replace('postgres_test', 'nextjs_dashboard');
      console.log('\n或者创建专用数据库:');
      console.log(`POSTGRES_URL="${nextjsUrl}"`);
      console.log('\n创建数据库的SQL命令:');
      console.log('CREATE DATABASE nextjs_dashboard;');
    }
    
  } else {
    console.log('\n❌ 所有配置都失败了');
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查PostgreSQL服务状态');
    console.log('2. 重置postgres用户密码');
    console.log('3. 检查pg_hba.conf认证配置');
    console.log('4. 使用pgAdmin或其他工具确认连接信息');
    console.log('5. 考虑使用Docker: npm run db:docker');
  }
}

main().catch(console.error);