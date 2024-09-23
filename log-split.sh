#!/bin/bash

# 获取当前日期，格式为 YYYY-MM-DD
current_date=$(date +%Y-%m-%d)

# 日志文件夹路径
log_dir="./logs"

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

