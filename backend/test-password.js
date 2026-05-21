import bcrypt from 'bcryptjs'

// 测试密码哈希
const testPasswords = async () => {
  const password123 = '123'
  const password666 = '666'
  const password888 = '888'
  const passwordXu123 = 'xu123'

  const hash123 = await bcrypt.hash(password123, 10)
  const hash666 = await bcrypt.hash(password666, 10)
  const hash888 = await bcrypt.hash(password888, 10)
  const hashXu123 = await bcrypt.hash(passwordXu123, 10)

  console.log('密码 123 的哈希:', hash123)
  console.log('密码 666 的哈希:', hash666)
  console.log('密码 888 的哈希:', hash888)
  console.log('密码 xu123 的哈希:', hashXu123)
  console.log()

  // 验证
  const test1 = await bcrypt.compare('123', hash123)
  const test2 = await bcrypt.compare('666', hash666)
  const test3 = await bcrypt.compare('888', hash888)
  const test4 = await bcrypt.compare('xu123', hashXu123)

  console.log('123 验证:', test1)
  console.log('666 验证:', test2)
  console.log('888 验证:', test3)
  console.log('xu123 验证:', test4)
}

testPasswords()
