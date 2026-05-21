import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'data', 'database.json')

const resetDatabase = async () => {
  console.log('正在重置数据库...')

  // 确保data目录存在
  const dataDir = path.join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // 生成密码哈希
  const hash123 = await bcrypt.hash('123', 10)
  const hash666 = await bcrypt.hash('666', 10)
  const hash888 = await bcrypt.hash('888', 10)
  const hashXu123 = await bcrypt.hash('xu123', 10)

  console.log('生成的密码哈希:')
  console.log('123:', hash123)
  console.log('666:', hash666)
  console.log('888:', hash888)
  console.log('xu123:', hashXu123)
  console.log()

  const newDatabase = {
    users: [
      // 学委账号 (密码: 123)
      { id: 'dsj2401', username: 'dsj2401', password: hash123, role: 'classMonitor', className: '大数据2401' },
      { id: 'ds2401', username: 'ds2401', password: hash123, role: 'classMonitor', className: '电商2401' },
      { id: 'ds2402', username: 'ds2402', password: hash123, role: 'classMonitor', className: '电商2402' },
      { id: 'ds2403', username: 'ds2403', password: hash123, role: 'classMonitor', className: '电商2403' },
      { id: 'jw2401', username: 'jw2401', password: hash123, role: 'classMonitor', className: '计网2401' },
      { id: 'jw2402', username: 'jw2402', password: hash123, role: 'classMonitor', className: '计网2402' },
      { id: 'jw2403', username: 'jw2403', password: hash123, role: 'classMonitor', className: '计网2403' },
      { id: 'jw2404', username: 'jw2404', password: hash123, role: 'classMonitor', className: '计网2404' },
      { id: 'rj2401', username: 'rj2401', password: hash123, role: 'classMonitor', className: '软件2401' },
      { id: 'rj2402', username: 'rj2402', password: hash123, role: 'classMonitor', className: '软件2402' },
      { id: 'sn2401', username: 'sn2401', password: hash123, role: 'classMonitor', className: '室内2401' },
      { id: 'sn2402', username: 'sn2402', password: hash123, role: 'classMonitor', className: '室内2402' },
      { id: 'sm2401', username: 'sm2401', password: hash123, role: 'classMonitor', className: '数媒2401' },
      { id: 'sm2402', username: 'sm2402', password: hash123, role: 'classMonitor', className: '数媒2402' },
      { id: 'sm2403', username: 'sm2403', password: hash123, role: 'classMonitor', className: '数媒2403' },
      { id: 'wz2401', username: 'wz2401', password: hash123, role: 'classMonitor', className: '网直2401' },
      { id: 'dsj2501', username: 'dsj2501', password: hash123, role: 'classMonitor', className: '大数据2501' },
      { id: 'ds2501', username: 'ds2501', password: hash123, role: 'classMonitor', className: '电商2501' },
      { id: 'ds2502', username: 'ds2502', password: hash123, role: 'classMonitor', className: '电商2502' },
      { id: 'ds2503', username: 'ds2503', password: hash123, role: 'classMonitor', className: '电商2503' },
      { id: 'jw2501', username: 'jw2501', password: hash123, role: 'classMonitor', className: '计网2501' },
      { id: 'jw2502', username: 'jw2502', password: hash123, role: 'classMonitor', className: '计网2502' },
      { id: 'jw2503', username: 'jw2503', password: hash123, role: 'classMonitor', className: '计网2503' },
      { id: 'jw2504', username: 'jw2504', password: hash123, role: 'classMonitor', className: '计网2504' },
      { id: 'jw2505', username: 'jw2505', password: hash123, role: 'classMonitor', className: '计网2505' },
      { id: 'ai2501', username: 'ai2501', password: hash123, role: 'classMonitor', className: 'AI2501' },
      { id: 'ai2502', username: 'ai2502', password: hash123, role: 'classMonitor', className: 'AI2502' },
      { id: 'rj2501', username: 'rj2501', password: hash123, role: 'classMonitor', className: '软件2501' },
      { id: 'sn2501', username: 'sn2501', password: hash123, role: 'classMonitor', className: '室内2501' },
      { id: 'sm2501', username: 'sm2501', password: hash123, role: 'classMonitor', className: '数媒2501' },
      { id: 'sm2502', username: 'sm2502', password: hash123, role: 'classMonitor', className: '数媒2502' },
      { id: 'wz2501', username: 'wz2501', password: hash123, role: 'classMonitor', className: '网直2501' },
      { id: 'wz2502', username: 'wz2502', password: hash123, role: 'classMonitor', className: '网直2502' },
      { id: 'wz2503', username: 'wz2503', password: hash123, role: 'classMonitor', className: '网直2503' },
      // 干事账号 (密码: 666)
      { id: 'wt', username: 'wt', password: hash666, role: 'secretary', name: '王婷' },
      { id: 'wsx', username: 'wsx', password: hash666, role: 'secretary', name: '王帅鑫' },
      { id: 'wcc', username: 'wcc', password: hash666, role: 'secretary', name: '吴川川' },
      { id: 'chr', username: 'chr', password: hash666, role: 'secretary', name: '陈皓然' },
      { id: 'dyh', username: 'dyh', password: hash666, role: 'secretary', name: '杜雨含' },
      { id: 'yxl', username: 'yxl', password: hash666, role: 'secretary', name: '袁晓灵' },
      { id: 'lhy', username: 'lhy', password: hash666, role: 'secretary', name: '刘宏玥' },
      { id: 'zjd', username: 'zjd', password: hash666, role: 'secretary', name: '钟建党' },
      { id: 'dss', username: 'dss', password: hash666, role: 'secretary', name: '邓霜霜' },
      { id: 'tjy', username: 'tjy', password: hash666, role: 'secretary', name: '田佳钰' },
      { id: 'yx', username: 'yx', password: hash666, role: 'secretary', name: '袁祥' },
      { id: 'zxy', username: 'zxy', password: hash666, role: 'secretary', name: '周新月' },
      // 干部账号 (密码: 888)
      { id: 'dt', username: 'dt', password: hash888, role: 'cadre', name: '邓婷' },
      { id: 'lx', username: 'lx', password: hash888, role: 'cadre', name: '罗霞' },
      { id: 'lsy', username: 'lsy', password: hash888, role: 'cadre', name: '李双艳' },
      // 副会长账号 (密码: xu123)
      { id: 'xh', username: 'xh', password: hashXu123, role: 'vicePresident', name: '徐航' }
    ],
    classes: [
      { id: 'dsj2401', name: '大数据2401', instructor: '汪财源', department: '计算机科学与技术', count: 30 },
      { id: 'ds2401', name: '电商2401', instructor: '陈果', department: '计算机科学与技术', count: 36 },
      { id: 'ds2402', name: '电商2402', instructor: '陈果', department: '计算机科学与技术', count: 33 },
      { id: 'ds2403', name: '电商2403', instructor: '陈果', department: '计算机科学与技术', count: 43 },
      { id: 'jw2401', name: '计网2401', instructor: '王浩然', department: '计算机科学与技术', count: 42 },
      { id: 'jw2402', name: '计网2402', instructor: '周焕哲', department: '计算机科学与技术', count: 44 },
      { id: 'jw2403', name: '计网2403', instructor: '王悦', department: '计算机科学与技术', count: 37 },
      { id: 'jw2404', name: '计网2404', instructor: '王悦', department: '计算机科学与技术', count: 37 },
      { id: 'rj2401', name: '软件2401', instructor: '周焕哲', department: '计算机科学与技术', count: 34 },
      { id: 'rj2402', name: '软件2402', instructor: '周焕哲', department: '计算机科学与技术', count: 37 },
      { id: 'sn2401', name: '室内2401', instructor: '王浩然', department: '计算机科学与技术', count: 27 },
      { id: 'sn2402', name: '室内2402', instructor: '王浩然', department: '计算机科学与技术', count: 28 },
      { id: 'sm2401', name: '数媒2401', instructor: '汪财源', department: '计算机科学与技术', count: 26 },
      { id: 'sm2402', name: '数媒2402', instructor: '汪财源', department: '计算机科学与技术', count: 29 },
      { id: 'sm2403', name: '数媒2403', instructor: '汪财源', department: '计算机科学与技术', count: 28 },
      { id: 'wz2401', name: '网直2401', instructor: '汪财源', department: '计算机科学与技术', count: 24 },
      { id: 'dsj2501', name: '大数据2501', instructor: '龚世儒', department: '计算机科学与技术', count: 18 },
      { id: 'ds2501', name: '电商2501', instructor: '黄青', department: '计算机科学与技术', count: 28 },
      { id: 'ds2502', name: '电商2502', instructor: '黄青', department: '计算机科学与技术', count: 28 },
      { id: 'ds2503', name: '电商2503', instructor: '董雨豪', department: '计算机科学与技术', count: 42 },
      { id: 'jw2501', name: '计网2501', instructor: '杨克寒', department: '计算机科学与技术', count: 38 },
      { id: 'jw2502', name: '计网2502', instructor: '杨克寒', department: '计算机科学与技术', count: 37 },
      { id: 'jw2503', name: '计网2503', instructor: '杨克寒', department: '计算机科学与技术', count: 36 },
      { id: 'jw2504', name: '计网2504', instructor: '李家勇', department: '计算机科学与技术', count: 34 },
      { id: 'jw2505', name: '计网2505', instructor: '李家勇', department: '计算机科学与技术', count: 35 },
      { id: 'ai2501', name: 'AI2501', instructor: '龚世儒', department: '计算机科学与技术', count: 40 },
      { id: 'ai2502', name: 'AI2502', instructor: '龚世儒', department: '计算机科学与技术', count: 40 },
      { id: 'rj2501', name: '软件2501', instructor: '李家勇', department: '计算机科学与技术', count: 41 },
      { id: 'sn2501', name: '室内2501', instructor: '金佳玉', department: '计算机科学与技术', count: 26 },
      { id: 'sm2501', name: '数媒2501', instructor: '金佳玉', department: '计算机科学与技术', count: 35 },
      { id: 'sm2502', name: '数媒2502', instructor: '金佳玉', department: '计算机科学与技术', count: 37 },
      { id: 'wz2501', name: '网直2501', instructor: '高岚', department: '计算机科学与技术', count: 36 },
      { id: 'wz2502', name: '网直2502', instructor: '高岚', department: '计算机科学与技术', count: 41 },
      { id: 'wz2503', name: '网直2503', instructor: '董雨豪', department: '计算机科学与技术', count: 42 }
    ],
    attendance: [],
    supervision: [],
    notifications: [],
    anomalies: [],
    images: []
  }

  fs.writeFileSync(dbPath, JSON.stringify(newDatabase, null, 2))
  console.log('✅ 数据库重置成功！')
  console.log()
  console.log('📝 可用账号:')
  console.log('   学委: rj2402 / 密码: 123')
  console.log('   干事: wt / 密码: 666')
  console.log('   干部: dt / 密码: 888')
  console.log('   副会长: xh / 密码: xu123')
  console.log()
  console.log('请重启后端服务器以加载新数据库！')
}

resetDatabase().catch(console.error)
