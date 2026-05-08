#!/bin/bash

set -euo pipefail
shopt -s nullglob

# 用脚本所在目录推导项目根目录，避免 cron 下 pwd 不可靠。
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="${1:-$script_dir}"
log_dir="$project_dir/logs"
timestamp="$(date +%Y-%m-%d_%H-%M-%S)"
lock_dir="$log_dir/.log-split.lock"

if [ ! -d "$project_dir" ]; then
  echo "项目目录不存在: $project_dir" >&2
  exit 1
fi

if [ ! -d "$log_dir" ]; then
  echo "日志目录不存在: $log_dir" >&2
  exit 1
fi

if ! mkdir "$lock_dir" 2>/dev/null; then
  echo "已有日志切分任务在运行，跳过本次执行: $lock_dir" >&2
  exit 1
fi

cleanup() {
  rmdir "$lock_dir" 2>/dev/null || true
}

trap cleanup EXIT

split_one_log() {
  local source_file="$1"
  local file_name
  local archive_file
  local temp_file

  if [ ! -f "$source_file" ]; then
    return 0
  fi

  if [ ! -s "$source_file" ]; then
    echo "跳过空日志文件: $source_file"
    return 0
  fi

  file_name="$(basename "$source_file")"
  archive_file="$log_dir/${timestamp}.${file_name}"
  temp_file="${archive_file}.tmp.$$"

  if ! cp -p "$source_file" "$temp_file"; then
    echo "备份失败，保留原日志文件不清空: $source_file" >&2
    rm -f "$temp_file"
    return 1
  fi

  mv "$temp_file" "$archive_file"

  if ! : > "$source_file"; then
    echo "清空原日志文件失败，请手动检查: $source_file" >&2
    return 1
  fi

  echo "日志文件 $source_file 已备份为 $archive_file 并清空原文件"
}

matched_files=("$log_dir"/err*.log "$log_dir"/out*.log)

if [ "${#matched_files[@]}" -eq 0 ]; then
  echo "未找到需要切分的日志文件: $log_dir"
  exit 0
fi

for log_file in "${matched_files[@]}"; do
  split_one_log "$log_file"
done
