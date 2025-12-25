import postgres from 'postgres';

// 数据库连接配置
const connectionString = process.env.POSTGRES_URL!;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// 创建数据库连接
export const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10, // 最大连接数
  idle_timeout: 20, // 空闲超时时间(秒)
  connect_timeout: 10, // 连接超时时间(秒)
});

// 测试数据库连接
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully:', result[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// 关闭数据库连接 (在应用关闭时调用)
export async function closeConnection() {
  await sql.end();
}