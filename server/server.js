import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';

// 配置
import config from './config/env/default.js';

// 路由
import userRoutes from './api/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建Express应用
const app = express();
const PORT = config.port;

// 中间件
app.use(cors(config.cors));
app.use(bodyParser.json());
app.use(express.static(join(__dirname, '../dist'))); // 生产环境中提供前端静态文件

// API路由
app.use('/api/user', userRoutes);

// 处理SPA路由
app.get('*', (req, res) => {
  // API路径不重定向到前端
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API not found' });
  }
  
  // 前端路由 - 返回index.html
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT} (${config.nodeEnv})`);
});

export default app; 