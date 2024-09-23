#!/bin/bash

# 检查是否传入了路径参数
if [ -z "$1" ]; then
  echo "请传入日志文件夹路径作为参数"
  exit 1
fi

# 获取传入的日志目录路径并切换到该目录
target_dir="$1"

# 检查日志目录是否存在
if [ ! -d "$target_dir" ]; then
  echo "目标路径不存在: $target_dir"
  exit 1
fi

cd "$target_dir" || exit

# 获取当前日期，格式为 YYYY-MM-DD
current_date=$(date +%Y-%m-%d)

# 日志文件夹路径
log_dir="$(pwd)/logs"

# 遍历错误日志文件 (err-*.log)
for err_log in "$log_dir"/err-*.log; do
  # 获取日志文件的文件名部分 (不带路径)
  log_filename=$(basename "$err_log")

  # 生成新的文件名，添加日期前缀
  new_log_file="$log_dir/${current_date}.${log_filename}"

  # 将错误日志文件的内容复制到新的文件中
  cp "$err_log" "$new_log_file"

  # 清空源错误日志文件
  : > "$err_log"

  echo "日志文件 $err_log 已备份为 $new_log_file 并清空原文件"
done

# 遍历普通日志文件 (err-*.log)
for out_log in "$log_dir"/out-*.log; do
  # 获取日志文件的文件名部分 (不带路径)
  log_filename=$(basename "$out_log")

  # 生成新的文件名，添加日期前缀
  new_log_file="$log_dir/${current_date}.${log_filename}"

  # 将错误日志文件的内容复制到新的文件中
  cp "$out_log" "$new_log_file"

  # 清空源错误日志文件
  : > "$out_log"

  echo "日志文件 $out_log 已备份为 $new_log_file 并清空原文件"
done

