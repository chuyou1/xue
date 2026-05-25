import bcrypt from 'bcryptjs'

const testPasswords = async () => {
  // 测试学委账号密码
  const classMonitorHash = '$2a$10$s9FeZuTtlnxhPgA5kz/hzuSlFuRnCmfAqGRdfyhF64odBHfbhDPM6'
  const isClassMonitorValid = await bcrypt.compare('123', classMonitorHash)
  console.log(`学委账号密码验证 (123): ${isClassMonitorValid}`)
  
  // 测试副会长账号密码
  const vpHash = '$2a$10$dCJSO1vAeTOCfqqCYjsQ9.NB1R5U/U8hzJ.4Cz0vV4WkfFgcvqL2G'
  const isVPValid = await bcrypt.compare('xu123', vpHash)
  console.log(`副会长账号密码验证 (xu123): ${isVPValid}`)
  
  // 测试干事账号密码
  const secretaryHash = '$2a$10$sT0wh8YUS715ZrijflBdy.olhEUHrTeRO71fPD97ES1X.DgTeqELW'
  const isSecretaryValid = await bcrypt.compare('666', secretaryHash)
  console.log(`干事账号密码验证 (666): ${isSecretaryValid}`)
  
  // 测试干部账号密码
  const cadreHash = '$2a$10$dY7mi9FTMJedzBxks9bMeuHL3JgdiI/nnxPylvsXO6ZPNQmTKb4Te'
  const isCadreValid = await bcrypt.compare('888', cadreHash)
  console.log(`干部账号密码验证 (888): ${isCadreValid}`)
  
  // 重新生成密码哈希
  console.log('\n重新生成的密码哈希:')
  console.log('学委 (123):', await bcrypt.hash('123', 10))
  console.log('干事 (666):', await bcrypt.hash('666', 10))
  console.log('干部 (888):', await bcrypt.hash('888', 10))
  console.log('副会长 (xu123):', await bcrypt.hash('xu123', 10))
}

testPasswords()
