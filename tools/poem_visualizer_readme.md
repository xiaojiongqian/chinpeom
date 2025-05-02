# 多语言诗歌可视化工具 - 技术实现说明

## 核心技术框架
- 基于PyQt5实现GUI界面
- 使用JSON格式存储多语言诗歌数据
- 采用树形结构展示诗歌层次关系

## 主要组件实现

### 数据加载与管理
- 支持六种语言：中文、英文、法语、德语、日语、西班牙语
- 采用JSON文件存储格式，文件命名为`poem_{language}.json`
- 程序启动时自动检测并加载所有可用语言文件
- 以中文数据作为基础，若不可用则使用其他语言

### 界面结构
- 主窗口采用水平分割器(QSplitter)分为左右两部分
- 左侧为树形视图(QTreeWidget)，用于展示诗歌的层次结构
- 右侧为内容显示区(QTextEdit)和操作按钮(QPushButton)

### 树形结构设计
- 顶层节点：诗歌标题
- 二级节点：id、title、author、sentence等属性
- 三级节点：具体的句子内容及多语言版本

### 核心功能实现
- **树形结构填充**：`populate_tree()`方法递归构建诗歌的树形结构
- **内容查看**：`on_tree_select()`方法根据选中项目类型显示对应内容
- **内容编辑**：`edit_content()`支持修改诗歌标题、作者和句子内容
- **内容删除**：`delete_content()`支持删除整首诗或单个句子
- **数据保存**：`save_poem()`和`save_all_poems()`实现数据持久化

### 异常处理
- 采用try-except机制捕获各类异常
- 详细记录错误信息并显示给用户
- 使用QMessageBox展示错误信息和操作确认

## 数据结构
诗歌JSON格式设计：
```json
[
  {
    "id": "诗歌ID",
    "title": "诗歌标题",
    "author": "作者",
    "sentence": [
      {
        "senid": 1,
        "content": "第一句内容"
      },
      {
        "senid": 2,
        "content": "第二句内容"
      }
    ]
  }
]
```

## 技术特点
- 完全跨平台兼容性
- 支持多语言并行管理
- 实时保存与同步更新
- 树形结构直观展示层次关系 

## 改进建议

### 用户界面优化
1. ✅ **键盘导航支持**：增强树状节点的键盘导航功能，使用键盘上下键移动选中节点时，右侧内容区域应自动更新显示，与鼠标点击效果一致。
   - 实现方法：为树形组件添加`currentItemChanged`信号连接到`on_tree_select`处理函数
   - 已实现：通过连接`currentItemChanged`信号，支持键盘导航时内容区域同步更新

2. ✅ **按钮状态智能控制**：根据当前选中节点类型动态设置按钮可用状态
   - 当前节点支持编辑时，"修改"按钮可用，否则置灰
   - 当前节点类型为poem或sentence_item时，"删除"按钮可用，否则置灰
   - 在`on_tree_select`方法中添加按钮状态控制逻辑
   - 已实现：根据节点类型智能控制按钮状态，提高用户体验

3. ✅ **编辑界面优化**：
   - 将更新内容时的输入对话框扩大，使用`QInputDialog.getMultiLineText`替代现有的`QInputDialog.getText`
   - 对于长文本内容，提供更舒适的编辑体验
   - 已实现：标题、作者和诗句内容编辑时使用多行文本框，ID仍使用单行文本框

### 多语言同步更新保障
- ✅ 在`edit_content`和`delete_content`方法中加强对复用节点（如id、title等）的检查
- ✅ 添加验证机制确保所有6个语言文件都能正确同步更新
- ✅ 在保存前进行完整性检查，确保数据一致性
- 已实现：加入检查机制，显示警告信息，并报告成功更新/删除的语言数量

## 实现细节

### 改进实现一：键盘导航支持
```python
# 连接树项目键盘选择信号
self.tree.currentItemChanged.connect(lambda current, previous: self.on_tree_select(current) if current else None)
```

### 改进实现二：按钮状态智能控制
```python
# 设置修改按钮状态 - 只有id、title、author和content_lang类型可以修改
can_edit = item_type in ["id", "title", "author", "content_lang"]
self.edit_button.setEnabled(can_edit)

# 设置删除按钮状态 - 只有poem和sentence_item类型可以删除
can_delete = item_type in ["poem", "sentence_item"]
self.delete_button.setEnabled(can_delete)
```

### 改进实现三：编辑界面优化与多语言同步
```python
# 对标题和作者使用多行文本输入
if item_type in ["title", "author"]:
    new_value, ok = QInputDialog.getMultiLineText(
        self, 
        "修改", 
        f"请输入新的{item_type}:", 
        current_value
    )
```

### 多语言同步检查
```python
# 检查是否所有加载的语言都已更新
if len(updated_langs) != len(self.poem_data):
    not_updated = set(self.poem_data.keys()) - set(updated_langs)
    warning = f"警告：以下语言未更新成功: {', '.join(not_updated)}"
    print(warning)
    QMessageBox.warning(self, "部分语言未更新", warning)
``` 