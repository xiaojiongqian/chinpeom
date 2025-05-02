#!/usr/bin/env python3
import json
import os

def process_json(input_file):
    """将多语言JSON文件拆分为每种语言一个单独的JSON文件"""
    # 读取输入文件
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 定义语言列表
    languages = ['chinese', 'english', 'spanish', 'japanese', 'french', 'german']
    
    # 为每种语言创建一个新的数据结构
    lang_data = {lang: [] for lang in languages}
    
    # 处理每个诗歌条目
    for poem in data:
        poem_id = poem['id']
        title = poem['title']
        author = poem['author']
        tags = poem['tag']
        
        # 为每种语言创建句子列表
        for lang in languages:
            sentences = []
            # 处理每个句子
            for i, sentence in enumerate(poem['sentence-multilang']):
                if lang in sentence:
                    sentences.append({
                        'senid': i,  # 使用索引作为句子ID
                        'content': sentence[lang]
                    })
            
            # 将处理后的诗歌添加到对应语言的数据中
            lang_data[lang].append({
                'id': poem_id,
                'title': title,
                'author': author,
                'tag': tags,
                'sentence': sentences
            })
    
    # 保存每种语言的数据到单独的文件
    base_dir = os.path.dirname(input_file)
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    
    for lang in languages:
        output_file = os.path.join(base_dir, f"{base_name}_{lang}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(lang_data[lang], f, ensure_ascii=False, indent=4)
        print(f"已创建 {output_file}")

def main():
    # 获取输入文件路径
    input_file = "/Users/vik.qian/study/tools/poem_alllang.json"
    
    # 处理JSON文件
    process_json(input_file)
    print("处理完成！")

if __name__ == "__main__":
    main()
