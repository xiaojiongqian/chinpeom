// 测试环境fetch验证脚本
// 用于确认测试环境中全局fetch模拟是否正常工作

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 创建临时测试文件
const tempTestFile = path.join(process.cwd(), 'temp-fetch-test.js');

// 测试文件内容
const testFileContent = `
import { expect, it, describe, beforeAll, afterAll } from 'vitest';

// 记录初始环境
console.log('测试环境信息:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- fetch类型:', typeof fetch);
console.log('- fetch是否为函数:', typeof fetch === 'function');
console.log('- fetch.toString():', fetch.toString().substring(0, 150));

describe('fetch模拟验证', () => {
  it('应该能够发送请求并获取响应', async () => {
    // 发送请求
    const url = '/resource/data/poem_chinese.json';
    console.log('发送请求:', url);
    
    const response = await fetch(url);
    console.log('收到响应');
    console.log('- response.ok:', response.ok);
    console.log('- response.status:', response.status);
    
    expect(response.ok).toBe(true);
    
    // 解析JSON
    const data = await response.json();
    console.log('解析JSON成功');
    console.log('- 数据类型:', typeof data);
    console.log('- 是否数组:', Array.isArray(data));
    if (Array.isArray(data)) {
      console.log('- 数组长度:', data.length);
      if (data.length > 0) {
        console.log('- 第一项ID:', data[0].id);
      }
    }
    
    expect(Array.isArray(data)).toBe(true);
  });
});
`;

try {
  // 写入临时测试文件
  fs.writeFileSync(tempTestFile, testFileContent);
  console.log(`临时测试文件已创建: ${tempTestFile}`);

  // 运行测试
  console.log('开始运行fetch验证测试...');
  console.log('============================================================');

  const testProcess = spawnSync('npx', ['vitest', 'run', '--no-threads', tempTestFile], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  console.log('============================================================');
  console.log(`测试完成，退出代码: ${testProcess.status}`);

  // 清理临时文件
  fs.unlinkSync(tempTestFile);
  console.log(`临时测试文件已删除: ${tempTestFile}`);

  // 返回测试结果
  process.exit(testProcess.status || 0);
} catch (error) {
  console.error('运行验证测试出错:', error);
  
  // 尝试清理
  try {
    if (fs.existsSync(tempTestFile)) {
      fs.unlinkSync(tempTestFile);
      console.log(`临时测试文件已删除: ${tempTestFile}`);
    }
  } catch (cleanupError) {
    console.error('清理时出错:', cleanupError);
  }
  
  process.exit(1);
} 