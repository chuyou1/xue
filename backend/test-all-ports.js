import http from 'http'

console.log('🔍 测试所有可能的端口...\n')

const ports = [3001, 3002, 3003, 4000, 5000]

async function testPort(port) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ username: 'xh', password: 'xu123' })
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 2000
    }
    
    const req = http.request(options, (res) => {
      let result = ''
      res.on('data', (d) => result += d)
      res.on('end', () => {
        try {
          const json = JSON.parse(result)
          resolve({ port, success: res.statusCode === 200, data: json })
        } catch (e) {
          resolve({ port, success: false, data: result })
        }
      })
    })
    
    req.on('error', () => resolve({ port, success: false }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ port, success: false, timeout: true })
    })
    
    req.write(data)
    req.end()
  })
}

async function testAllPorts() {
  for (const port of ports) {
    console.log(`测试端口 ${port}...`)
    const result = await testPort(port)
    if (result.success) {
      console.log(`✅ 端口 ${port} 可用! 登录成功!`)
      console.log(`   用户: ${result.data.username}`)
      console.log(`   角色: ${result.data.role}`)
      console.log(`\n👉 使用端口: ${port}`)
      return port
    }
  }
  console.log('❌ 没有找到可用的后端端口!')
  return null
}

testAllPorts()
