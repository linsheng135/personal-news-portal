#!/usr/bin/env node

import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  
  const items = readdirSync(src)
  for (const item of items) {
    const srcPath = join(src, item)
    const destPath = join(dest, item)
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

function main() {
  try {
    console.log('📁 开始复制数据文件到dist目录...')
    
    const sourceDir = join(__dirname, '..', 'src', 'data')
    const targetDir = join(__dirname, '..', 'dist', 'src', 'data')
    
    if (!existsSync(sourceDir)) {
      console.log('⚠️  源数据目录不存在:', sourceDir)
      return
    }
    
    console.log(`源目录: ${sourceDir}`)
    console.log(`目标目录: ${targetDir}`)
    
    // 复制数据文件
    copyDir(sourceDir, targetDir)
    
    console.log('✅ 数据文件复制完成!')
    console.log(`✅ 复制到: ${targetDir}`)
    
    // 验证复制结果
    if (existsSync(targetDir)) {
      const files = readdirSync(targetDir, { recursive: true })
      console.log(`✅ 已复制 ${files.length} 个文件/目录`)
    }
    
  } catch (error) {
    console.error('❌ 复制数据文件失败:', error.message)
    console.error('错误堆栈:', error.stack)
    process.exit(1)
  }
}

main()