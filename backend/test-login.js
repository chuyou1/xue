import('node-fetch').then(async ({ default: fetch }) => {
  const baseUrl = 'http://localhost:3001'

  console.log('🔍 测试登录功能...\n')

  const testAccounts = [
    { username: 'rj2402', password: '123', role: '学委' },
    { username: 'wt', password: '666', role: '干事' },
    { username: 'dt', password: '888', role: '干部' },
    { username: 'xh', password: 'xu123', role: '副会长' }
  ]

  for (const account of testAccounts) {
    try {
      console.log(`测试 ${account.role} 账号: ${account.username}...`)
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: account.username, password: account.password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${account.role} 登录成功!`)
        console.log(`   用户ID: ${data.id}`)
        console.log(`   用户名: ${data.username}`)
        console.log(`   角色: ${data.role}`)
        if (data.className) console.log(`   班级: ${data.className}`)
        if (data.name) console.log(`   姓名: ${data.name}`)
      } else {
        console.log(`❌ ${account.role} 登录失败: ${data.message}`)
      }
    } catch (error) {
      console.log(`❌ ${account.role} 登录错误:`, error.message)
    }
    console.log()
  }

  console.log('🏁 所有账号测试完成!')
}).catch(console.error)
