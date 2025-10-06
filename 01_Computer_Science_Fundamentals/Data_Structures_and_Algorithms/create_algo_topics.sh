#!/bin/bash

# 建立算法題目
for topic in \
"sorting_algorithms_comparison:排序算法全解析:5:5:快排, 歸併, 堆排序, 穩定性" \
"sorting_practical_applications:排序算法實際應用:6:4:外部排序, 分散式排序, TopK" \
"binary_search_variants:二分搜尋及其變體:5:5:二分搜尋, 查找邊界, 旋轉陣列" \
"depth_first_search:深度優先搜尋 (DFS):6:5:DFS, 回溯, 排列組合, 路徑搜尋" \
"breadth_first_search:廣度優先搜尋 (BFS):6:5:BFS, 最短路徑, 層級遍歷" \
"dynamic_programming_basics:動態規劃基礎與套路:7:5:DP, 狀態轉移, 背包問題, 最長子序列" \
"dynamic_programming_advanced:動態規劃進階題型:8:4:區間DP, 狀態壓縮, 樹形DP" \
"greedy_algorithm:貪心算法原理與應用:6:4:貪心, 區間問題, 霍夫曼編碼" \
"two_pointers_technique:雙指針技巧總結:5:5:雙指針, 快慢指針, 對撞指針" \
"sliding_window_algorithm:滑動窗口算法:6:5:滑動窗口, 子串問題, 最值問題" \
"bit_manipulation:位運算技巧與應用:5:4:位運算, 權限管理, 狀態壓縮"
do
  IFS=':' read -r filename title difficulty importance tags <<< "$topic"
  
  cat > "${filename}.md" << EOF
# ${title}

- **難度**: ${difficulty}
- **重要程度**: ${importance}
- **標籤**: \`${tags}\`

## 問題詳述

(問題描述和應用場景)

## 核心理論與詳解

### 1. 算法原理

(算法思想和原理...)

### 2. 實現步驟

(詳細實現步驟...)

### 3. 時間與空間複雜度

(複雜度分析...)

### 4. 典型題目

(LeetCode 經典題目列表...)

## 總結

(要點總結...)
EOF
  
  echo "✓ ${filename}.md"
done

# 建立實際應用題目（重點題目）
for topic in \
"consistent_hashing:一致性雜湊在分散式系統中的應用:7:5:一致性雜湊, 負載均衡, 分散式快取" \
"rate_limiting_algorithms:限流算法實現:6:5:令牌桶, 漏桶, 滑動窗口, 限流" \
"distributed_id_generation:分散式 ID 生成算法:7:5:Snowflake, UUID, 分散式ID" \
"delayed_queue_implementation:延遲佇列實現:7:4:延遲佇列, 時間輪, 定時任務" \
"big_data_processing:海量資料處理:8:4:bitmap, 外部排序, 分治, MapReduce"
do
  IFS=':' read -r filename title difficulty importance tags <<< "$topic"
  
  cat > "${filename}.md" << EOF
# ${title}

- **難度**: ${difficulty}
- **重要程度**: ${importance}
- **標籤**: \`${tags}\`

## 問題詳述

(實際業務場景和問題)

## 核心理論與詳解

### 1. 業務需求

(業務背景和需求...)

### 2. 技術方案

(多種解決方案對比...)

### 3. 實現細節

(詳細實現...)

### 4. 實際應用

(在真實系統中的應用案例...)

## 總結

(要點總結...)
EOF
  
  echo "✓ ${filename}.md"
done

echo ""
echo "所有題目框架建立完成！"
echo "現在建立核心題目的完整內容..."

