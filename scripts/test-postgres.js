const postgres = require('postgres');

// 常见的PostgreSQL配置
const configs = [
  {
    name: '默认postgres用户，无密码',
    url: 'postgresql://postgres@localhost:5432/postgres',
  },
  {
    name: '默认postgres用户，密码postgres',
    url: 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  {
    name: '默认postgres用户，密码123456',
    url: 'postgresql://postgres:123456@localhost:5432/postgres',
  },
  {
    name: '默认postgres用户，密码admin',
    url: 'postgresql://postgres:admin@localhost:5432/postgres',
  },
  {
    name: '默认postgres用户，密码root',
    url: 'postgresql://postgres:root@localhost:5432/postgres',
  },
];

async function testConnection(config) {
  try {
    console.log(`\n🔍 测试: ${config.name}`);
    console.log(`   URL: ${config.url.replace(/:([^:@]+)@/, ':***@')}`);

    const sql = postgres(config.url, {
      max: 1,
      connect_timeout: 5,
      ssl: false,
    });

    const result = await sql`
      SELECT 
        current_user as username,
        version() as version,
        current_database() as database,
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

async function main() {
  console.log('🔍 PostgreSQL 连接测试\n');
  console.log('正在测试常见的PostgreSQL配置...');

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

    // 列出数据库
    const databases = await listDatabases(workingConfig);

    // 检查是否有nextjs_dashboard数据库
    const hasTargetDb = databases.includes('nextjs_dashboard');

    console.log('\n📝 建议的配置:');
    if (hasTargetDb) {
      const targetUrl = workingConfig.url.replace('/postgres', '/nextjs_dashboard');
      console.log(`POSTGRES_URL="${targetUrl}"`);
    } else {
      console.log(`POSTGRES_URL="${workingConfig.url}"`);
      console.log('\n⚠️  注意: nextjs_dashboard 数据库不存在');
      console.log('你可以创建它或使用默认的 postgres 数据库');
    }
  } else {
    console.log('\n❌ 所有配置都失败了');
    console.log('\n可能的原因:');
    console.log('1. PostgreSQL 使用了非标准的用户名/密码');
    console.log('2. PostgreSQL 配置了特殊的认证方式');
    console.log('3. 防火墙阻止了连接');
    console.log('\n建议使用 Docker 方式: npm run db:docker');
  }
}

main().catch(console.error);
