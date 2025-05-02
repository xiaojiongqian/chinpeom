#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import re

def process_json_file(filename):
    # 读取JSON文件
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 标记是否有修改
    modified = False
    
    # 遍历所有诗句
    for poem in data:
        for sentence in poem.get('sentence', []):
            content = sentence.get('content', '')
            
            # 如果内容仅以中文句号"。"结尾且没有其他标点符号
            if content.endswith('。') and not re.search(r'[，、；：""''《》？！（）【】『』「」]', content):
                # 移除末尾的句号
                sentence['content'] = content[:-1]
                modified = True
    
    # 如果有修改，保存回文件
    if modified:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"处理完成: {filename}，移除了仅有句号结尾的内容")
    else:
        print(f"处理完成: {filename}，没有需要修改的内容")

if __name__ == "__main__":
    # 处理两个文件
    process_json_file('poem_chinese.json')
    process_json_file('poem_japanese.json') 