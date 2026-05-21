import http from 'http'

console.log('🔍 测试后端API...\n')

const testAccounts = [
  { username: 'rj2402', password: '123', role: '学委' },
  { username: 'wt', password: '666', role: '干事' },
  { username: 'dt', password: '888', role: '干部' },
  { username: 'xh', password: 'xu123', role: '副会长' }
]

function testLogin(account) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: account.username, password: account.password })
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }
    
    const req = http.request(options, (res) => {
      let result = ''
      
      res.on('data', (d) => {
        result += d
      })
      
      res.on('end', () => {
        try {
          const json = JSON.parse(result)
          resolve({ account, status: res.statusCode, data: json })
        } catch (e) {
          resolve({ account, status: res.statusCode, data: result })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.write(data)
    req.end()
  })
}

async function runTests() {
  for (const account of testAccounts) {
    try {
      console.log(`测试 ${account.role} 账号: ${account.username}...`)
      const { status, data } = await testLogin(account)
      
      if (status === 200) {
        console.log(`✅ ${account.role} 登录成功!`)
        console.log(`   用户ID: ${data.id}`)
        console.log(`   用户名: ${data.username}`)
        console.log(`   角色: ${data.role}`)
        if (data.className) console.log(`   班级: ${data.className}`)
        if (data.name) console.log(`   姓名: ${data.name}`)
      } else {
        console.log(`❌ ${account.role} 登录失败 (${status}): ${data.message}`)
      }
    } catch (error) {
      console.log(`❌ ${account.role} 登录错误:`, error.message)
    }
    console.log()
  }
  
  console.log('🏁 所有账号测试完成!')
}

runTests().catch(console.error)
