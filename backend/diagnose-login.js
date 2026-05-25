import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'data', 'database.json')

console.log('🔍 开始登录问题诊断...\n')

// 1. 读取数据库数据
console.log('=== 步骤1: 检查数据库密码数据 ===')
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
const users = dbData.users

// 检查特殊账号
const targetUsers = ['rj2402', 'xh', 'wt', 'dt']

console.log('\n目标账号密码哈希值检查:')
targetUsers.forEach(username => {
  const user = users.find(u => u.username === username)
  if (user) {
    console.log(`\n账号: ${username}`)
    console.log(`  密码哈希: ${user.password}`)
    console.log(`  哈希长度: ${user.password.length}`)
    console.log(`  哈希格式验证: ${user.password.startsWith('$2a$') ? '✅ bcrypt格式正确' : '❌ 格式异常'}`)
    console.log(`  角色: ${user.role}`)
    if (user.className) console.log(`  班级: ${user.className}`)
    if (user.name) console.log(`  姓名: ${user.name}`)
  } else {
    console.log(`\n❌ 账号 ${username} 不存在于数据库`)
  }
})

// 2. 验证密码加密规则
console.log('\n\n=== 步骤2: 密码加密规则验证 ===')
const testPasswords = [
  { username: 'rj2402', password: '123' },
  { username: 'xh', password: 'xu123' },
  { username: 'wt', password: '666' },
  { username: 'dt', password: '888' }
]

console.log('\n密码比对测试:')
testPasswords.forEach(async ({ username, password }) => {
  const user = users.find(u => u.username === username)
  if (user) {
    try {
      const isValid = await bcrypt.compare(password, user.password)
      console.log(`${username}: ${password} -> ${isValid ? '✅ 验证通过' : '❌ 验证失败'}`)
    } catch (error) {
      console.log(`${username}: ❌ 验证异常 - ${error.message}`)
    }
  }
})

// 3. 检查哈希一致性
console.log('\n\n=== 步骤3: 哈希一致性检查 ===')
const hashGroups = {}
users.forEach(user => {
  const hash = user.password
  if (!hashGroups[hash]) {
    hashGroups[hash] = []
  }
  hashGroups[hash].push(user.username)
})

console.log('密码哈希分组统计:')
Object.entries(hashGroups).forEach(([hash, usernames]) => {
  console.log(`\n哈希值 (${usernames.length}个账号共享): ${hash.substring(0, 20)}...`)
  console.log(`  账号列表: ${usernames.join(', ')}`)
})

// 4. 检查异常情况
console.log('\n\n=== 步骤4: 异常数据检测 ===')
const anomalies = []

users.forEach(user => {
  // 检查空密码
  if (!user.password || user.password.trim() === '') {
    anomalies.push({ username: user.username, issue: '密码为空' })
  }
  // 检查密码长度异常
  if (user.password && user.password.length < 10) {
    anomalies.push({ username: user.username, issue: `密码过短 (${user.password.length}字符)` })
  }
  // 检查非bcrypt格式
  if (user.password && !user.password.startsWith('$2a$')) {
    anomalies.push({ username: user.username, issue: '非bcrypt加密格式' })
  }
})

if (anomalies.length > 0) {
  console.log('❌ 发现异常账号:')
  anomalies.forEach(a => console.log(`  - ${a.username}: ${a.issue}`))
} else {
  console.log('✅ 未发现异常账号')
}

console.log('\n=== 诊断完成 ===')
