import sys
import json
import os
import traceback
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QPushButton, QTreeWidget, QTreeWidgetItem, 
                            QTextEdit, QLabel, QMessageBox, QInputDialog, QSplitter)
from PyQt5.QtCore import Qt

class PoemVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("多语言诗歌可视化工具")
        self.resize(1200, 800)
        
        # 显示当前工作目录和文件列表，用于调试
        current_dir = os.getcwd()
        files = os.listdir(current_dir)
        print(f"当前工作目录: {current_dir}")
        print(f"目录中的文件: {files}")
        
        # 获取项目根目录路径（根据当前脚本位置向上一级）
        if current_dir.endswith('tools'):
            root_dir = os.path.dirname(current_dir)
        else:
            root_dir = current_dir
            
        print(f"项目根目录: {root_dir}")
        
        # 加载所有语言的诗歌数据
        self.languages = ["chinese", "english", "french", "german", "japanese", "spanish"]
        self.poem_data = {}
        
        # 检查文件是否存在
        for lang in self.languages:
            file_path = os.path.join(root_dir, "resource", f"poem_{lang}.json")
            if not os.path.exists(file_path):
                print(f"警告: 文件 {file_path} 不存在!")
                QMessageBox.warning(self, "文件不存在", f"文件 {file_path} 不存在!")
        
        for lang in self.languages:
            try:
                file_path = os.path.join(root_dir, "resource", f"poem_{lang}.json")
                with open(file_path, "r", encoding="utf-8") as f:
                    self.poem_data[lang] = json.load(f)
                    print(f"成功加载 {lang} 数据，包含 {len(self.poem_data[lang])} 首诗")
            except Exception as e:
                error_msg = f"无法加载 {lang} 诗歌文件: {str(e)}"
                print(f"错误: {error_msg}")
                print(traceback.format_exc())
                QMessageBox.critical(self, "加载错误", error_msg)
        
        # 检查是否有任何数据被加载
        if not self.poem_data:
            error_msg = "没有成功加载任何诗歌数据，程序无法继续"
            print(f"错误: {error_msg}")
            QMessageBox.critical(self, "严重错误", error_msg)
            sys.exit(1)
        
        # 使用中文版本作为基础，如果中文版本不可用，则使用第一个可用的语言
        if "chinese" in self.poem_data:
            self.base_data = self.poem_data["chinese"]
            print("使用中文数据作为基础")
        else:
            for lang in self.languages:
                if lang in self.poem_data:
                    self.base_data = self.poem_data[lang]
                    print(f"中文数据不可用，使用 {lang} 数据作为基础")
                    break
            else:
                error_msg = "没有可用的基础数据，程序无法继续"
                print(f"错误: {error_msg}")
                QMessageBox.critical(self, "严重错误", error_msg)
                sys.exit(1)
                
        # 创建中央窗口部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 创建主布局
        main_layout = QHBoxLayout(central_widget)
        
        # 创建分割器
        splitter = QSplitter(Qt.Horizontal)
        main_layout.addWidget(splitter)
        
        # 创建左侧窗口部件（树形视图）
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        
        # 添加树形视图
        self.tree = QTreeWidget()
        self.tree.setHeaderLabels(["名称", "ID", "类型"])
        left_layout.addWidget(self.tree)
        
        # 将左侧窗口添加到分割器
        splitter.addWidget(left_widget)
        
        # 创建右侧窗口部件（内容显示和按钮）
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        
        # 添加标签
        self.content_label = QLabel("内容预览")
        right_layout.addWidget(self.content_label)
        
        # 添加文本编辑器
        self.content_text = QTextEdit()
        self.content_text.setReadOnly(True)
        self.content_text.setText("欢迎使用多语言诗歌可视化工具\n请从左侧树中选择项目查看内容")
        right_layout.addWidget(self.content_text)
        
        # 添加按钮布局
        button_layout = QHBoxLayout()
        
        # 添加编辑按钮
        self.edit_button = QPushButton("修改")
        self.edit_button.clicked.connect(self.edit_content)
        button_layout.addWidget(self.edit_button)
        
        # 添加删除按钮
        self.delete_button = QPushButton("删除")
        self.delete_button.clicked.connect(self.delete_content)
        button_layout.addWidget(self.delete_button)
        
        # 添加刷新按钮
        self.refresh_button = QPushButton("刷新")
        self.refresh_button.clicked.connect(self.populate_tree)
        button_layout.addWidget(self.refresh_button)
        
        # 将按钮布局添加到右侧布局
        right_layout.addLayout(button_layout)
        
        # 将右侧窗口添加到分割器
        splitter.addWidget(right_widget)
        
        # 设置分割器初始大小比例
        splitter.setSizes([400, 800])
        
        # 当前选中的项目ID和类型
        self.current_item_id = None
        self.current_item_type = None
        
        # 连接树项目点击信号
        self.tree.itemClicked.connect(self.on_tree_select)
        
        # 连接树项目键盘选择信号（改进点1：添加键盘导航支持）
        self.tree.currentItemChanged.connect(lambda current, previous: self.on_tree_select(current) if current else None)
        
        # 填充树形视图
        try:
            print("开始填充树状视图...")
            self.populate_tree()
            print("树状视图填充完成")
        except Exception as e:
            error_msg = f"填充树状视图时出错: {str(e)}"
            print(f"错误: {error_msg}")
            print(traceback.format_exc())
            QMessageBox.critical(self, "填充错误", error_msg)

    def populate_tree(self):
        # 清空现有树
        self.tree.clear()
        
        if not self.base_data:
            print("警告: 基础数据为空，无法填充树")
            QMessageBox.warning(self, "数据错误", "基础数据为空，无法填充树")
            return
        
        print(f"开始处理 {len(self.base_data)} 首诗...")
        
        # 创建根节点项目
        root_items = []
        
        # 添加诗歌列表
        for i, poem in enumerate(self.base_data):
            try:
                poem_id = poem["id"]
                poem_title = poem["title"]
                print(f"处理诗歌 {i+1}/{len(self.base_data)}: {poem_title} (ID: {poem_id})")
                
                # 创建诗歌节点
                poem_item = QTreeWidgetItem([poem_title, poem_id, "poem"])
                root_items.append(poem_item)
                
                # 添加诗歌属性
                id_item = QTreeWidgetItem(["id", poem_id, "id"])
                poem_item.addChild(id_item)
                
                title_item = QTreeWidgetItem(["title", poem_title, "title"])
                poem_item.addChild(title_item)
                
                author_item = QTreeWidgetItem(["author", poem["author"], "author"])
                poem_item.addChild(author_item)
                
                # 添加句子节点
                sentence_item = QTreeWidgetItem(["sentence", poem_id, "sentence"])
                poem_item.addChild(sentence_item)
                
                # 添加每个句子
                for sen in poem["sentence"]:
                    sen_id = sen["senid"]
                    sen_item = QTreeWidgetItem([f"句子 {sen_id}", f"{poem_id}_{sen_id}", "sentence_item"])
                    sentence_item.addChild(sen_item)
                    
                    # 添加句子ID
                    senid_item = QTreeWidgetItem(["senid", str(sen_id), "senid"])
                    sen_item.addChild(senid_item)
                    
                    # 添加内容节点
                    content_item = QTreeWidgetItem(["content", f"{poem_id}_{sen_id}", "content"])
                    sen_item.addChild(content_item)
                    
                    # 添加各语言内容
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            continue
                            
                        lang_poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                        if lang_poem:
                            lang_sen = self.find_sentence_by_id(lang_poem, sen_id)
                            if lang_sen:
                                lang_content = lang_sen["content"]
                                lang_item = QTreeWidgetItem([lang, f"{poem_id}_{sen_id}_{lang}", "content_lang"])
                                # 存储内容为数据
                                lang_item.setData(0, Qt.UserRole, lang_content)
                                content_item.addChild(lang_item)
                
            except Exception as e:
                error_msg = f"处理诗歌 {i+1} 时出错: {str(e)}"
                print(f"错误: {error_msg}")
                print(traceback.format_exc())
        
        # 将根项目添加到树中
        self.tree.addTopLevelItems(root_items)
        
        # 如果有项目，选择第一个
        if root_items:
            self.tree.setCurrentItem(root_items[0])
            self.on_tree_select(root_items[0], 0)

    def find_poem_by_id(self, data, poem_id):
        for poem in data:
            if poem["id"] == poem_id:
                return poem
        return None

    def find_sentence_by_id(self, poem, senid):
        for sen in poem["sentence"]:
            if sen["senid"] == senid:
                return sen
        return None

    def on_tree_select(self, item, column=0):
        try:
            if not item:
                return
                
            item_id = item.text(1)  # ID 在第二列
            item_type = item.text(2)  # 类型在第三列
            
            print(f"选中项目: ID={item_id}, 类型={item_type}")
            
            self.current_item_id = item_id
            self.current_item_type = item_type
            
            # 清空内容区域
            self.content_text.clear()
            
            # 改进点2：根据节点类型设置按钮状态
            # 设置修改按钮状态 - 只有id、title、author和content_lang类型可以修改
            can_edit = item_type in ["id", "title", "author", "content_lang"]
            self.edit_button.setEnabled(can_edit)
            
            # 设置删除按钮状态 - 只有poem和sentence_item类型可以删除
            can_delete = item_type in ["poem", "sentence_item"]
            self.delete_button.setEnabled(can_delete)
            
            if item_type == "poem":
                # 显示整首诗的所有信息
                poem = self.find_poem_by_id(self.base_data, item_id)
                if poem:
                    self.content_text.append(f"ID: {poem['id']}")
                    self.content_text.append(f"标题: {poem['title']}")
                    self.content_text.append(f"作者: {poem['author']}")
                    self.content_text.append("")
                    self.content_text.append("句子:")
                    for sen in poem["sentence"]:
                        self.content_text.append(f"  {sen['senid']}: {sen['content']}")
                    
            elif item_type == "id" or item_type == "title" or item_type == "author":
                # 查找父节点，获取poem_id
                parent = item.parent()
                poem_id = parent.text(1)
                
                poem = self.find_poem_by_id(self.base_data, poem_id)
                if poem:
                    if item_type == "id":
                        self.content_text.append(f"ID: {poem['id']}")
                    elif item_type == "title":
                        self.content_text.append(f"标题: {poem['title']}")
                    elif item_type == "author":
                        self.content_text.append(f"作者: {poem['author']}")
            
            elif item_type == "sentence":
                # 显示所有句子
                poem_id = item_id
                poem = self.find_poem_by_id(self.base_data, poem_id)
                if poem:
                    for sen in poem["sentence"]:
                        self.content_text.append(f"句子 {sen['senid']}: {sen['content']}")
            
            elif item_type == "sentence_item":
                # 显示特定句子
                parts = item_id.split("_")
                poem_id = parts[0]
                sen_id = int(parts[1])
                
                poem = self.find_poem_by_id(self.base_data, poem_id)
                if poem:
                    sen = self.find_sentence_by_id(poem, sen_id)
                    if sen:
                        self.content_text.append(f"句子 {sen['senid']}: {sen['content']}")
            
            elif item_type == "content":
                # 显示所有语言的内容
                parts = item_id.split("_")
                poem_id = parts[0]
                sen_id = int(parts[1])
                
                for lang in self.languages:
                    if lang not in self.poem_data:
                        continue
                        
                    poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                    if poem:
                        sen = self.find_sentence_by_id(poem, sen_id)
                        if sen:
                            self.content_text.append(f"{lang}: {sen['content']}")
            
            elif item_type == "content_lang":
                # 显示特定语言的内容
                content = item.data(0, Qt.UserRole)
                if content:
                    self.content_text.setText(content)
        
        except Exception as e:
            error_msg = f"处理选择事件时出错: {str(e)}"
            print(f"错误: {error_msg}")
            print(traceback.format_exc())
            self.content_text.clear()
            self.content_text.append(f"错误: {error_msg}")
            
            # 出错时禁用按钮
            self.edit_button.setEnabled(False)
            self.delete_button.setEnabled(False)

    def edit_content(self):
        try:
            item = self.tree.currentItem()
            if not item:
                QMessageBox.information(self, "提示", "请先选择要修改的内容")
                return
                
            item_id = item.text(1)
            item_type = item.text(2)
            
            print(f"尝试修改: ID={item_id}, 类型={item_type}")
            
            # 对不同类型的内容进行不同的修改处理
            if item_type == "id" or item_type == "title" or item_type == "author":
                parent = item.parent()
                poem_id = parent.text(1)
                
                # 获取当前值
                current_value = ""
                for lang in self.languages:
                    if lang not in self.poem_data:
                        continue
                        
                    poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                    if poem and lang == "chinese":
                        if item_type == "id":
                            current_value = poem["id"]
                        elif item_type == "title":
                            current_value = poem["title"]
                        elif item_type == "author":
                            current_value = poem["author"]
                
                # 对标题和作者使用多行文本输入
                if item_type in ["title", "author"]:
                    new_value, ok = QInputDialog.getMultiLineText(
                        self, 
                        "修改", 
                        f"请输入新的{item_type}:", 
                        current_value
                    )
                else:
                    # ID使用单行输入
                    new_value, ok = QInputDialog.getText(
                        self, 
                        "修改", 
                        f"请输入新的{item_type}:", 
                        text=current_value
                    )
                
                if ok and new_value:
                    # 检查是否所有语言版本都加载成功
                    missing_langs = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            missing_langs.append(lang)
                    
                    if missing_langs:
                        warning = f"警告：以下语言未加载: {', '.join(missing_langs)}\n这些语言不会被更新。"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未加载", warning)
                    
                    # 修改所有语言版本的值
                    updated_langs = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            continue
                            
                        poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                        if poem:
                            if item_type == "id":
                                poem["id"] = new_value
                            elif item_type == "title":
                                poem["title"] = new_value
                            elif item_type == "author":
                                poem["author"] = new_value
                            updated_langs.append(lang)
                    
                    # 检查是否所有加载的语言都已更新
                    if len(updated_langs) != len(self.poem_data):
                        not_updated = set(self.poem_data.keys()) - set(updated_langs)
                        warning = f"警告：以下语言未更新成功: {', '.join(not_updated)}"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未更新", warning)
                    
                    # 保存修改
                    self.save_all_poems()
                    # 刷新树
                    self.populate_tree()
                    QMessageBox.information(self, "成功", f"已成功修改 {len(updated_langs)} 种语言版本")
            
            elif item_type == "content_lang":
                # 修改特定语言的句子内容
                parts = item_id.split("_")
                poem_id = parts[0]
                sen_id = int(parts[1])
                lang = parts[2]
                
                if lang not in self.poem_data:
                    QMessageBox.critical(self, "错误", f"未加载 {lang} 数据")
                    return
                    
                poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                if poem:
                    sen = self.find_sentence_by_id(poem, sen_id)
                    if sen:
                        current_content = sen["content"]
                        
                        # 改进点3: 使用多行文本输入框替代单行文本框
                        new_content, ok = QInputDialog.getMultiLineText(
                            self, 
                            "修改", 
                            f"请输入新的{lang}内容:", 
                            current_content
                        )
                        
                        if ok and new_content:
                            sen["content"] = new_content
                            # 保存修改
                            self.save_poem(lang)
                            # 更新数据
                            item.setData(0, Qt.UserRole, new_content)
                            # 刷新内容显示
                            self.on_tree_select(item)
                            QMessageBox.information(self, "成功", "修改成功")
        
        except Exception as e:
            error_msg = f"修改内容时出错: {str(e)}"
            print(f"错误: {error_msg}")
            print(traceback.format_exc())
            QMessageBox.critical(self, "修改错误", error_msg)

    def delete_content(self):
        try:
            item = self.tree.currentItem()
            if not item:
                QMessageBox.information(self, "提示", "请先选择要删除的内容")
                return
                
            item_id = item.text(1)
            item_type = item.text(2)
            
            print(f"尝试删除: ID={item_id}, 类型={item_type}")
            
            # 只允许删除整首诗或整个句子
            if item_type == "poem":
                reply = QMessageBox.question(self, "确认", "确定要删除这首诗吗？此操作将删除所有语言版本的这首诗。",
                                             QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
                
                if reply == QMessageBox.Yes:
                    poem_id = item_id
                    
                    # 检查是否所有语言版本都加载成功
                    missing_langs = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            missing_langs.append(lang)
                    
                    if missing_langs:
                        warning = f"警告：以下语言未加载: {', '.join(missing_langs)}\n这些语言不会被删除。"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未加载", warning)
                    
                    # 从所有语言版本中删除
                    successful_deletions = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            continue
                            
                        lang_data = self.poem_data[lang]
                        poem_found = False
                        for i, poem in enumerate(lang_data):
                            if poem["id"] == poem_id:
                                del lang_data[i]
                                poem_found = True
                                successful_deletions.append(lang)
                                break
                        
                        if not poem_found:
                            print(f"警告: 在 {lang} 版本中未找到ID为 {poem_id} 的诗歌")
                    
                    # 检查是否所有加载的语言都已删除
                    if len(successful_deletions) != len(self.poem_data):
                        not_deleted = set(self.poem_data.keys()) - set(successful_deletions)
                        warning = f"警告：在以下语言中未找到要删除的诗歌: {', '.join(not_deleted)}"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未删除", warning)
                    
                    # 保存修改
                    self.save_all_poems()
                    # 刷新树
                    self.populate_tree()
                    QMessageBox.information(self, "成功", f"已从 {len(successful_deletions)} 种语言版本中删除诗歌")
            
            elif item_type == "sentence_item":
                reply = QMessageBox.question(self, "确认", "确定要删除这个句子吗？此操作将删除所有语言版本的这个句子。",
                                             QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
                
                if reply == QMessageBox.Yes:
                    parts = item_id.split("_")
                    poem_id = parts[0]
                    sen_id = int(parts[1])
                    
                    # 检查是否所有语言版本都加载成功
                    missing_langs = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            missing_langs.append(lang)
                    
                    if missing_langs:
                        warning = f"警告：以下语言未加载: {', '.join(missing_langs)}\n这些语言不会被更新。"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未加载", warning)
                    
                    # 从所有语言版本中删除
                    successful_deletions = []
                    for lang in self.languages:
                        if lang not in self.poem_data:
                            continue
                            
                        poem = self.find_poem_by_id(self.poem_data[lang], poem_id)
                        if poem:
                            sentence_found = False
                            for i, sen in enumerate(poem["sentence"]):
                                if sen["senid"] == sen_id:
                                    del poem["sentence"][i]
                                    sentence_found = True
                                    successful_deletions.append(lang)
                                    break
                            
                            if not sentence_found:
                                print(f"警告: 在 {lang} 版本的诗歌 {poem_id} 中未找到句子ID {sen_id}")
                    
                    # 检查是否所有加载的语言都已删除句子
                    if len(successful_deletions) != len(self.poem_data):
                        not_deleted = set(self.poem_data.keys()) - set(successful_deletions)
                        warning = f"警告：在以下语言中未找到要删除的句子: {', '.join(not_deleted)}"
                        print(warning)
                        QMessageBox.warning(self, "部分语言未删除", warning)
                    
                    # 保存修改
                    self.save_all_poems()
                    # 刷新树
                    self.populate_tree()
                    QMessageBox.information(self, "成功", f"已从 {len(successful_deletions)} 种语言版本中删除句子")
            
            else:
                QMessageBox.information(self, "提示", "只能删除整首诗或整个句子")
        
        except Exception as e:
            error_msg = f"删除内容时出错: {str(e)}"
            print(f"错误: {error_msg}")
            print(traceback.format_exc())
            QMessageBox.critical(self, "删除错误", error_msg)

    def save_poem(self, lang):
        try:
            # 获取项目根目录路径
            current_dir = os.getcwd()
            if current_dir.endswith('tools'):
                root_dir = os.path.dirname(current_dir)
            else:
                root_dir = current_dir
                
            file_path = os.path.join(root_dir, "resource", f"poem_{lang}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(self.poem_data[lang], f, ensure_ascii=False, indent=4)
            print(f"成功保存 {lang} 数据")
        except Exception as e:
            error_msg = f"无法保存 {lang} 诗歌文件: {str(e)}"
            print(f"错误: {error_msg}")
            print(traceback.format_exc())
            QMessageBox.critical(self, "保存错误", error_msg)

    def save_all_poems(self):
        for lang in self.languages:
            if lang in self.poem_data:
                self.save_poem(lang)

def main():
    try:
        print("程序启动")
        app = QApplication(sys.argv)
        window = PoemVisualizer()
        window.show()
        print("显示主窗口")
        sys.exit(app.exec_())
    except Exception as e:
        print(f"程序崩溃: {str(e)}")
        print(traceback.format_exc())
        if 'app' in locals():
            QMessageBox.critical(None, "程序错误", f"程序发生错误: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 