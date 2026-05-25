import http from 'http'

console.log('🔍 开始完整登录流程验证...\n')

// 模拟前端登录请求
async function simulateLogin(username, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ username, password })
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 5000
    }
    
    const req = http.request(options, (res) => {
      let result = ''
      res.on('data', (d) => result += d)
      res.on('end', () => {
        try {
          const json = JSON.parse(result)
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data: json,
            username,
            password
          })
        } catch (e) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            error: result,
            username,
            password
          })
        }
      })
    })
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        username,
        password
      })
    })
    
    req.write(data)
    req.end()
  })
}

// 测试用例
const testCases = [
  // 正确的账号密码
  { username: 'rj2402', password: '123', description: '学委正确密码' },
  { username: 'xh', password: 'xu123', description: '副会长正确密码' },
  { username: 'wt', password: '666', description: '干事正确密码' },
  { username: 'dt', password: '888', description: '干部正确密码' },
  
  // 错误的账号密码
  { username: 'rj2402', password: 'wrong', description: '学委错误密码' },
  { username: 'xh', password: 'wrong', description: '副会长错误密码' },
  { username: 'nonexistent', password: '123', description: '不存在的账号' },
  
  // 边界情况
  { username: '', password: '123', description: '空账号' },
  { username: 'rj2402', password: '', description: '空密码' },
  { username: '  rj2402  ', password: '123', description: '账号带空格' },
  { username: 'rj2402', password: '  123  ', description: '密码带空格' },
  { username: 'RJ2402', password: '123', description: '账号大写' },
]

async function runTests() {
  console.log('=== 测试登录接口 ===')
  console.log('后端服务: http://localhost:4000/api/auth/login')
  console.log('测试时间:', new Date().toLocaleString())
  console.log('\n' + '='.repeat(80))
  
  let passed = 0
  let failed = 0
  
  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.description}`)
    console.log(`账号: "${testCase.username}" | 密码: "${testCase.password}"`)
    
    const result = await simulateLogin(testCase.username, testCase.password)
    
    if (result.success) {
      console.log(`✅ 登录成功`)
      console.log(`   用户ID: ${result.data.id}`)
      console.log(`   用户名: ${result.data.username}`)
      console.log(`   角色: ${result.data.role}`)
      passed++
    } else {
      console.log(`❌ 登录失败`)
      if (result.statusCode) console.log(`   状态码: ${result.statusCode}`)
      if (result.data && result.data.message) console.log(`   错误信息: ${result.data.message}`)
      if (result.error) console.log(`   错误详情: ${result.error}`)
      failed++
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log(`测试结果: 通过 ${passed} / 失败 ${failed}`)
  
  if (failed > 0) {
    console.log('\n⚠️ 发现问题，建议检查:')
    console.log('1. 后端登录接口实现')
    console.log('2. 密码比对逻辑')
    console.log('3. 账号查询逻辑')
  } else {
    console.log('\n✅ 所有测试通过！登录系统运行正常')
  }
}

runTests().catch(console.error)
