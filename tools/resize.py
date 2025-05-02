import os
from PIL import Image
import argparse

def resize_and_convert_to_webp(source_dir):
    """
    遍历指定目录下的图片文件，缩放为512x512，并转换为WebP格式
    保存到同级目录的poem_images文件夹中
    """
    # 创建输出目录
    output_dir = os.path.join(os.path.dirname(source_dir), 'poem_images')
    os.makedirs(output_dir, exist_ok=True)
    
    # 支持的图片格式
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff']
    
    # 遍历源目录
    count = 0
    for filename in os.listdir(source_dir):
        # 检查文件是否为图片
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext in image_extensions:
            try:
                # 构建完整的文件路径
                input_path = os.path.join(source_dir, filename)
                
                # 构建输出文件路径 (保持文件名，更改扩展名为.webp)
                output_filename = os.path.splitext(filename)[0] + '.webp'
                output_path = os.path.join(output_dir, output_filename)
                
                # 打开并处理图片
                with Image.open(input_path) as img:
                    # 缩放图片为512x512，保持纵横比
                    img.thumbnail((512, 512))
                    
                    # 创建一个512x512的新图片（白色背景）
                    new_img = Image.new("RGB", (512, 512), (255, 255, 255))
                    
                    # 将缩放后的图片粘贴到中心位置
                    position = ((512 - img.width) // 2, (512 - img.height) // 2)
                    new_img.paste(img, position)
                    
                    # 保存为WebP格式，质量设为90%
                    new_img.save(output_path, 'WEBP', quality=90)
                
                count += 1
                print(f"已处理: {filename} -> {output_filename}")
            
            except Exception as e:
                print(f"处理 {filename} 时出错: {e}")
    
    print(f"已完成！共处理 {count} 个图片，保存到 {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="将图片缩放为512x512并转换为WebP格式")
    parser.add_argument("source_dir", help="源图片目录的路径")
    args = parser.parse_args()
    
    if not os.path.isdir(args.source_dir):
        print(f"错误: {args.source_dir} 不是有效的目录")
    else:
        resize_and_convert_to_webp(args.source_dir)
