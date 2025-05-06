// 诗歌功能测试专用启动器
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 获取当前目录
const currentDir = process.cwd();
console.log(`当前工作目录: ${currentDir}`);

// 创建测试日志目录
const logDir = path.join(currentDir, 'test-logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 创建日志文件
const timestamp = new Date().toISOString().replace(/:/g, '-');
const logFile = path.join(logDir, `poem-test-${timestamp}.log`);

// 设置环境变量
const env = {
  ...process.env,
  NODE_ENV: 'test',
  VITEST_MODE: 'verbose',
  DEBUG: 'true',
  TEST_LOG_FILE: logFile
};

// 要测试的文件列表
const testFiles = [
  'tests/components/PoemDisplay.test.ts',
  'tests/utils/poemTranslation.spec.ts',
  'tests/utils/poemData.spec.ts'
];

// 运行测试
console.log(`开始运行诗歌基础功能测试，日志将保存到: ${logFile}`);
console.log('============================================================');
console.log(`将测试以下文件:\n- ${testFiles.join('\n- ')}`);
console.log('============================================================');

// 使用子进程运行测试，以便可以捕获所有输出
const testProcess = spawnSync('npx', [
  'vitest', 
  'run', 
  '--mode=development', 
  '--reporter=verbose',
  ...testFiles
], {
  cwd: currentDir,
  env,
  stdio: ['pipe', 'pipe', 'pipe'],
  encoding: 'utf-8'
});

// 获取输出
const output = testProcess.stdout || '';
const errors = testProcess.stderr || '';
const allOutput = `# 标准输出\n${output}\n\n# 错误输出\n${errors}`;

// 保存日志
fs.writeFileSync(logFile, allOutput);

// 打印摘要
console.log('============================================================');
console.log(`测试完成，退出代码: ${testProcess.status}`);
console.log(`详细日志已保存到: ${logFile}`);

if (testProcess.status !== 0) {
  console.error('测试失败，错误摘要:');
  
  // 提取错误信息
  const errorLines = errors.split('\n').filter(line => 
    line.includes('Error:') || 
    line.includes('FAIL') || 
    line.includes('AssertionError')
  );
  
  if (errorLines.length > 0) {
    console.error(errorLines.join('\n'));
  } else {
    console.error(errors.split('\n').slice(-20).join('\n')); // 显示最后20行错误输出
  }
} else {
  console.log('所有测试通过！');
}