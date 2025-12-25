const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 PostgreSQL 认证修复工具\n');

// 检查pg_hba.conf文件
function checkPgHbaConfig() {
  const possiblePaths = [
    'C:\\Program Files\\PostgreSQL\\14\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\15\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\16\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\17\\data\\pg_hba.conf',
    'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf'
  ];
  
  console.log('🔍 查找 pg_hba.conf 文件...');
  
  for (const configPath of possiblePaths) {
    try {
      if (fs.existsSync(configPath)) {
        console.log(`✅ 找到配置文件: ${configPath}`);
        
        const content = fs.readFileSync(configPath, 'utf8');
        const lines = content.split('\n');
        
        console.log('\n📋 当前认证配置:');
        lines.forEach((line, index) => {
          if (line.trim() && !line.startsWith('#') && line.includes('127.0.0.1')) {
            console.log(`   ${index + 1}: ${line.trim()}`);
          }
        });
        
        // 检查是否使用trust认证
        const hasTrust = content.includes('trust');
        const hasMd5 = content.includes('md5');
        const hasScramSha256 = content.includes('scram-sha-256');
        
        console.log('\n🔐 认证方式:');
        console.log(`   Trust (无密码): ${hasTrust ? '✅' : '❌'}`);
        console.log(`   MD5: ${hasMd5 ? '✅' : '❌'}`);
        console.log(`   SCRAM-SHA-256: ${hasScramSha256 ? '✅' : '❌'}`);
        
        return configPath;
      }
    } catch (error) {
      // 忽略错误，继续查找
    }
  }
  
  console.log('❌ 未找到 pg_hba.conf 文件');
  return null;
}

// 生成修复建议
function generateFixSuggestions() {
  console.log('\n💡 修复建议:\n');
  
  console.log('方案1: 临时启用trust认证 (最简单)');
  console.log('1. 找到 pg_hba.conf 文件');
  console.log('2. 备份原文件');
  console.log('3. 将以下行:');
  console.log('   host    all             all             127.0.0.1/32            md5');
  console.log('   改为:');
  console.log('   host    all             all             127.0.0.1/32            trust');
  console.log('4. 重启PostgreSQL服务');
  console.log('5. 测试连接后再改回md5并设置密码\n');
  
  console.log('方案2: 重置postgres用户密码');
  console.log('1. 以管理员身份打开命令提示符');
  console.log('2. 运行: psql -U postgres');
  console.log('3. 执行: ALTER USER postgres PASSWORD \'newpassword\';');
  console.log('4. 退出: \\q\n');
  
  console.log('方案3: 使用Windows认证');
  console.log('1. 确保当前Windows用户有PostgreSQL权限');
  console.log('2. 修改pg_hba.conf使用sspi认证\n');
  
  console.log('方案4: 使用Docker (推荐)');
  console.log('1. 启动Docker Desktop');
  console.log('2. 运行: npm run db:docker');
  console.log('3. 运行: npm run db:setup');
}

// 生成临时配置文件
function generateTempConfig(configPath) {
  if (!configPath) return;
  
  console.log('\n📝 生成临时配置文件...');
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const backupPath = configPath + '.backup.' + Date.now();
    
    // 创建备份
    fs.writeFileSync(backupPath, content);
    console.log(`✅ 备份文件已创建: ${backupPath}`);
    
    // 生成修改后的配置
    const modifiedContent = content.replace(
      /host\s+all\s+all\s+127\.0\.0\.1\/32\s+md5/g,
      'host    all             all             127.0.0.1/32            trust'
    ).replace(
      /host\s+all\s+all\s+127\.0\.0\.1\/32\s+scram-sha-256/g,
      'host    all             all             127.0.0.1/32            trust'
    );
    
    const tempConfigPath = path.join(__dirname, 'pg_hba_temp.conf');
    fs.writeFileSync(tempConfigPath, modifiedContent);
    
    console.log(`✅ 临时配置文件已生成: ${tempConfigPath}`);
    console.log('\n⚠️  手动操作步骤:');
    console.log(`1. 复制 ${tempConfigPath} 的内容`);
    console.log(`2. 替换 ${configPath} 的内容`);
    console.log('3. 重启PostgreSQL服务');
    console.log('4. 运行: npm run db:debug');
    
  } catch (error) {
    console.log('❌ 无法生成临时配置:', error.message);
  }
}

// 主函数
function main() {
  const configPath = checkPgHbaConfig();
  generateFixSuggestions();
  generateTempConfig(configPath);
  
  console.log('\n🎯 推荐操作顺序:');
  console.log('1. 如果有Docker，直接使用: npm run db:docker');
  console.log('2. 否则尝试方案1 (临时trust认证)');
  console.log('3. 连接成功后重新设置密码');
}

main();