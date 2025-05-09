# 需求描述
一个关于唐诗和外语混搭学习的Web应用,名"唐诗译境/Chinpoem", 使用Capacitor打包成APP

## 功能描述
1. 用户可以用有效的邮箱登录，登录后可记录学习得分，若不登录可以使用这个应用
2. 随机显示一首唐诗及其配图，某一句会抽出显示其它语言（如英语）
3. 根据其它语言的提示，在备选答案中选择正确的诗句
4. 备选答案除了正确答案外，根据一定的算法，随机在其它的相近长度的诗句提取，作为干扰
5. 登录用户记录得分，若正确，则得分+1(简单模式)或+2(困难模式), 若错误则得分-1(简单模式)或-2(困难模式)
6. 根据得分获得古代学级称号（白丁、学童... 状元）。
7. 设置界面,可以设置不同难度模式，简单模式可设置不同提示语言（如英语、西班牙语等），困难模式为无语言提示
   
## 界面要求
登录界面：
- 登录，输入账号（邮箱）、密码
- 注册，输入账号（邮箱）、密码
- 免登录体验模式，进入后直接答题
- 游戏介绍，"熟读（猜）唐诗三百首，不会作诗也会吟"
- 设置按钮，点击后进入设置界面

答题界面：
- 诗歌标题和作者
- 诗歌内容，其中一句被外文替代
- 4个选项，其中1个是正确答案，3个是类似长度的干扰项
- 当前诗句的配图
- 当前得分，古代学级称号
- 下一首按钮，点击后显示下一首诗
- 设置按钮，点击后进入设置界面

设置界面：
- 若已登录
  * 可账号退出、密码修改
  * 显示得分和等级（及其说明）
- 登录或未登录
  * 设置简单/困难模式
  * 简单模式下可选择外语提示的语种

## 技术描述
1. 使用Vue3开发, 使用Vite构建,使用TailwindCSS进行样式管理
2. 使用Capacitor打包成APP
3. 使用Pinia管理状态
4. 使用VueRouter管理路由
5. 使用VueI18n管理国际化，支持中文、英文、西班牙文、日文、法文、德文
6. 采用混合存储模式：
   - 核心诗歌数据作为静态资源打包在应用中，确保离线状态下可使用主要功能
   - 用户账户、排行榜等社交功能通过远程API实现
7. 服务端使用Express.js实现轻量级REST API，仅提供用户相关功能
8. 应用部署采用两种模式：
   - Web版本：前端静态资源与后端API部署在同一服务器
   - 移动应用版本：前端打包进应用，通过网络请求连接远程API服务器

## 资源描述
1. public/resource/data/ 文件夹中内置了唐诗约300首，以不同语言存放在不同JSON文件中，文件名称为poem_chinese.json, poem_english.json, poem_french.json, poem_german.json, poem_japanese.json, poem_spanish.json，这些文件结构相同。
2. public/resource/poem_images/ 文件夹中内置了唐诗约300首唐诗的配图，配图名字对应JSON中的id

## 数据结构
1. 用户表, 包含用户名, 密码, 得分, 古代学级称号, 提示语言
2. 诗歌资源JSON格式例子：
    {
        "id": "927908c0-999f-4d3f-8192-d67d28f93576",
        "title": "八阵图",
        "author": "杜甫",
        "sentence": [
            {
                "senid": 0,
                "content": "功盖三分国"
            },
            {
                "senid": 1,
                "content": "名高八阵图"
            },
            {
                "senid": 2,
                "content": "江流石不转"
            },
            {
                "senid": 3,
                "content": "遗恨失吞吴"
            }
        ]
    }
3. 古代学级称号对应得分：
-白丁：0-10分  
-学童：11-25分  
-秀才：26-45分  
-廪生：46-70分  
-贡生：71-100分  
-举人：101-135分  
-贡士：136-175分  
-进士：176-220分  
-探花：221-280分  
-榜眼：281-340分  
-状元：341分以上





