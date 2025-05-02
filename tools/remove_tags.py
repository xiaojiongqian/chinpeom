#!/usr/bin/env python3
import json
import os

def remove_tags_from_json(file_path):
    """从JSON文件中移除所有诗歌条目的'tag'字段"""
    # 读取输入文件
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 处理每个诗歌条目，移除'tag'字段
    for poem in data:
        if 'tag' in poem:
            del poem['tag']
    
    # 将修改后的数据写回原文件
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"已处理: {file_path}")

def main():
    # 定义需要处理的文件列表
    json_files = [
        "/Users/vik.qian/study/tools/poem_chinese.json",
        "/Users/vik.qian/study/tools/poem_english.json",
        "/Users/vik.qian/study/tools/poem_french.json",
        "/Users/vik.qian/study/tools/poem_german.json",
        "/Users/vik.qian/study/tools/poem_japanese.json",
        "/Users/vik.qian/study/tools/poem_spanish.json"
    ]
    
    # 处理每个文件
    for file_path in json_files:
        remove_tags_from_json(file_path)
    
    print("所有文件处理完成！")

if __name__ == "__main__":
    main()