import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 设置全局测试环境标记
process.env.NODE_ENV = 'test';
console.log(`[测试设置] 设置环境变量: NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`[测试设置] 当前平台: ${process.platform}, Node版本: ${process.version}`);

// 模拟vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  }))
}))

// 全局组件和翻译模拟
config.global.stubs = {
  RouterLink: true,
  RouterView: true
}

config.global.mocks = {
  $t: (key: string) => key
}

// 定义全局可访问的模拟诗歌数据
console.log('[测试设置] 定义全局模拟诗歌数据');

// 模拟API请求
const mockPoems = {
  chinese: [
    {
      id: 'poem-1',
      title: '静夜思',
      author: '李白',
      sentence: [
        { senid: 0, content: '床前明月光' },
        { senid: 1, content: '疑是地上霜' },
        { senid: 2, content: '举头望明月' },
        { senid: 3, content: '低头思故乡' }
      ]
    }
  ],
  english: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: 'Moonlight before my bed' },
        { senid: 1, content: 'I thought it was frost on the ground' },
        { senid: 2, content: 'Looking up to see the bright moon' },
        { senid: 3, content: 'Lowering my head in thoughts of home' }
      ]
    }
  ],
  french: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: 'Clair de lune devant mon lit' },
        { senid: 1, content: 'Je pensais que c\'était du givre sur le sol' },
        { senid: 2, content: 'Levant les yeux pour voir la lune brillante' },
        { senid: 3, content: 'Baissant la tête en pensant à mon pays natal' }
      ]
    }
  ],
  german: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: 'Mondlicht vor meinem Bett' },
        { senid: 1, content: 'Ich dachte, es wäre Frost auf dem Boden' },
        { senid: 2, content: 'Aufschauen, um den hellen Mond zu sehen' },
        { senid: 3, content: 'Den Kopf senken in Gedanken an die Heimat' }
      ]
    }
  ],
  spanish: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: 'Luz de luna frente a mi cama' },
        { senid: 1, content: 'Pensé que era escarcha en el suelo' },
        { senid: 2, content: 'Levantando la mirada para ver la luna brillante' },
        { senid: 3, content: 'Bajando la cabeza pensando en mi hogar' }
      ]
    }
  ],
  japanese: [
    {
      id: 'poem-1',
      sentence: [
        { senid: 0, content: '床前の月明かり' },
        { senid: 1, content: '地上の霜と思いき' },
        { senid: 2, content: '頭を上げて明月を望む' },
        { senid: 3, content: '頭を下げて故郷を思う' }
      ]
    }
  ]
};

// 添加到全局对象，以便在其他文件中访问
if (typeof window !== 'undefined') {
  (window as any).mockPoems = mockPoems;
  console.log('[测试设置] 将模拟诗歌数据添加到全局window对象');
} else {
  console.log('[测试设置] window对象不可用，无法添加全局mockPoems');
  // 在Node环境中添加到global
  (global as any).mockPoems = mockPoems;
  console.log('[测试设置] 将模拟诗歌数据添加到全局global对象');
}

// 计数器，用于跟踪fetch调用次数
let fetchCallCount = 0;

// 模拟fetch请求，增加详细日志和完整的Response对象
console.log('[测试设置] 开始模拟全局fetch函数');
global.fetch = vi.fn().mockImplementation((url: string | Request) => {
  fetchCallCount++;
  const callId = fetchCallCount;
  
  console.log(`[测试环境] fetch调用 #${callId}, URL: ${typeof url === 'string' ? url : 'Request对象'}`);
  console.log(`[测试环境] fetch调用堆栈: ${new Error().stack?.split('\n').slice(1, 4).join('\n')}`);
  
  // 统计URL模式和类型
  let urlString = '';
  let urlType = '';
  
  if (typeof url === 'string') {
    urlString = url;
    urlType = 'string';
  } else if (url instanceof Request) {
    urlString = url.url;
    urlType = 'Request';
  } else {
    urlString = String(url);
    urlType = typeof url;
  }
  
  console.log(`[测试环境] fetch #${callId} URL类型: ${urlType}, URL值: ${urlString}`);
  
  let poemData: any[] = [];
  let languageKey = '';
  let matchFound = false;
  
  // 提取语言键
  if (urlString.includes('poem_chinese.json')) {
    languageKey = 'chinese';
    matchFound = true;
  } else if (urlString.includes('poem_english.json')) {
    languageKey = 'english';
    matchFound = true;
  } else if (urlString.includes('poem_french.json')) {
    languageKey = 'french';
    matchFound = true;
  } else if (urlString.includes('poem_german.json')) {
    languageKey = 'german';
    matchFound = true;
  } else if (urlString.includes('poem_spanish.json')) {
    languageKey = 'spanish';
    matchFound = true;
  } else if (urlString.includes('poem_japanese.json')) {
    languageKey = 'japanese';
    matchFound = true;
  }
  
  if (matchFound) {
    if (mockPoems[languageKey]) {
      poemData = mockPoems[languageKey];
      console.log(`[测试环境] fetch #${callId} 返回${languageKey}语言数据，数据条数: ${poemData.length}`);
    } else {
      console.log(`[测试环境] fetch #${callId} 匹配到语言 ${languageKey}，但没有对应的mock数据`);
    }
  } else {
    console.log(`[测试环境] fetch #${callId} 未找到匹配语言: ${urlString}`);
  }
  
  // 构建更完整的Response对象
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  
  // 跟踪json方法调用
  let jsonCallCount = 0;
  
  // 返回一个更完整的Response对象
  const response = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => {
      jsonCallCount++;
      console.log(`[测试环境] fetch #${callId} response.json()被调用(第${jsonCallCount}次)`);
      console.log(`[测试环境] json调用堆栈: ${new Error().stack?.split('\n').slice(1, 4).join('\n')}`);
      
      // 延迟100ms以模拟网络延迟
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`[测试环境] fetch #${callId} 解析JSON完成，返回数据长度: ${poemData.length}`);
          resolve(poemData);
        }, 50);
      });
    },
    text: () => {
      console.log(`[测试环境] fetch #${callId} response.text()被调用`);
      return Promise.resolve(JSON.stringify(poemData));
    },
    headers: headers,
    redirected: false,
    type: 'basic' as ResponseType,
    url: urlString,
    clone: function() {
      console.log(`[测试环境] fetch #${callId} response.clone()被调用`);
      return this;
    },
    body: null,
    bodyUsed: false
  };
  
  console.log(`[测试环境] fetch #${callId} 返回响应对象`);
  
  return Promise.resolve(response as unknown as Response);
});

console.log('[测试设置] 全局fetch模拟函数设置完成');

// 在异步测试中模拟计时器
console.log('[测试设置] 设置模拟计时器');
vi.useFakeTimers();

// 模拟用户API
console.log('[测试设置] 开始模拟用户API');
vi.mock('../src/services/api.ts', () => {
  console.log('[测试设置] 模拟用户API服务');
  return {
    userApi: {
      register: vi.fn().mockImplementation((username, email, password) => {
        console.log(`[测试环境] 模拟用户注册: ${username}, ${email}`);
        return Promise.resolve({ 
          user: { id: 'test-user-id', username, email, score: 0 },
          token: 'mock-auth-token'
        });
      }),
      
      login: vi.fn().mockImplementation((email, password) => {
        console.log(`[测试环境] 模拟用户登录: ${email}`);
        return Promise.resolve({ 
          user: { id: 'test-user-id', username: email.split('@')[0], email, score: 10 },
          token: 'mock-auth-token'
        });
      }),
      
      logout: vi.fn(),
      
      getCurrentUser: vi.fn().mockImplementation(() => {
        console.log('[测试环境] 模拟获取当前用户');
        return Promise.resolve({ 
          id: 'test-user-id', 
          username: 'testuser', 
          email: 'test@example.com', 
          score: 15 
        });
      }),
      
      updateScore: vi.fn().mockImplementation((scoreDelta) => {
        console.log(`[测试环境] 模拟更新用户分数: ${scoreDelta}`);
        return Promise.resolve({ 
          id: 'test-user-id', 
          username: 'testuser', 
          email: 'test@example.com', 
          score: 15 + scoreDelta 
        });
      }),
      
      updateLanguage: vi.fn().mockImplementation((language) => {
        console.log(`[测试环境] 模拟更新用户语言: ${language}`);
        return Promise.resolve({ 
          id: 'test-user-id', 
          username: 'testuser', 
          email: 'test@example.com', 
          score: 15,
          preferredLanguage: language 
        });
      }),
      
      getLeaderboard: vi.fn().mockImplementation(() => {
        console.log('[测试环境] 模拟获取排行榜');
        return Promise.resolve([
          { id: 'user-1', username: 'topuser', score: 100 },
          { id: 'user-2', username: 'seconduser', score: 80 },
          { id: 'user-3', username: 'testuser', score: 15 }
        ]);
      })
    },
    
    isAuthenticated: vi.fn().mockImplementation(() => {
      return true;
    }),
    
    isOffline: vi.fn().mockImplementation(() => {
      return false;
    })
  };
});

console.log('[测试设置] 用户API模拟完成');