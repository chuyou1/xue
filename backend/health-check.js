import http from 'http'

console.log('🔍 检查后端健康状态...\n')

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
}

const req = http.request(options, (res) => {
  let result = ''
  
  res.on('data', (d) => {
    result += d
  })
  
  res.on('end', () => {
    console.log(`状态码: ${res.statusCode}`)
    console.log(`响应: ${result}`)
    if (res.statusCode === 200) {
      console.log('\n✅ 后端运行正常!')
    }
  })
})

req.on('error', (error) => {
  console.error('❌ 无法连接到后端:', error.message)
  console.log('\n请确保后端服务器正在运行!')
})

req.end()
