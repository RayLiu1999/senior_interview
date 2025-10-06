#!/bin/bash

# 建立題目框架
for topic in \
"array_and_dynamic_array:陣列與動態陣列:3:5:陣列, 動態擴容, 時間複雜度" \
"linked_list_problems:鏈結串列經典問題:5:5:鏈結串列, 快慢指針, 反轉, 環檢測" \
"stack_and_queue_applications:堆疊與佇列應用:4:5:堆疊, 佇列, 單調堆疊, 優先佇列" \
"binary_search_tree:二元搜尋樹 (BST) 原理:5:5:BST, 平衡樹, 紅黑樹, AVL" \
"b_tree_and_b_plus_tree:B 樹與 B+ 樹詳解:7:5:B樹, B+樹, 資料庫索引, MySQL" \
"trie_applications:字典樹 (Trie) 應用:6:4:Trie, 前綴樹, 自動補全, 敏感詞過濾" \
"binary_tree_traversal:二元樹遍歷與應用:4:5:前序, 中序, 後序, 層序遍歷" \
"hash_table_implementation:雜湊表原理與實現:6:5:雜湊函數, 碰撞解決, 一致性雜湊" \
"bloom_filter:布隆過濾器 (Bloom Filter):6:5:布隆過濾器, Redis, 去重, 快取穿透" \
"skip_list:跳躍表 (Skip List):7:4:跳躍表, Redis ZSet, 有序集合" \
"heap_implementation:堆的實現與應用:6:5:最大堆, 最小堆, 堆排序, Top K" \
"priority_queue_practice:優先佇列實戰:5:4:優先佇列, 任務調度, 事件處理" \
"graph_representation_traversal:圖的表示與遍歷:6:4:鄰接表, 鄰接矩陣, BFS, DFS" \
"shortest_path_algorithms:最短路徑算法:7:4:Dijkstra, Bellman-Ford, Floyd" \
"topological_sort:拓撲排序與依賴關係:6:4:拓撲排序, DAG, 任務依賴"
do
  IFS=':' read -r filename title difficulty importance tags <<< "$topic"
  
  cat > "${filename}.md" << EOF
# ${title}

- **難度**: ${difficulty}
- **重要程度**: ${importance}
- **標籤**: \`${tags}\`

## 問題詳述

(本題的核心問題和應用場景)

## 核心理論與詳解

### 1. 基本概念

(詳細理論解釋...)

### 2. 實現原理

(工作原理、演算法步驟...)

### 3. 時間與空間複雜度

(複雜度分析...)

### 4. 實際應用

(在後端系統中的應用...)

## 總結

(核心要點總結...)

作為資深後端工程師，你需要：
- 理解核心原理和實現細節
- 能夠分析時間與空間複雜度
- 掌握實際應用場景
- 能夠手寫核心程式碼
EOF
  
  echo "✓ ${filename}.md 已建立 (框架)"
done

echo ""
echo "資料結構題目框架建立完成！"

