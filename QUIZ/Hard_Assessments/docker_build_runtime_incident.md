# Docker Build／Runtime 事故診斷：映像、供應鏈與資源限制

- **Assessment ID**: `assessment.docker.build-runtime.incident.v1`
- **主要 Concept ID**: `concept.docker.build.dockerfile-practices`
- **次要 Concept IDs**:
  - `concept.docker.runtime.container-vm-isolation`
  - `concept.docker.build.image-layers-cache`
  - `concept.docker.security.supply-chain-runtime`
  - `concept.docker.runtime.resource-limits`
- **對應文章**:
  - [容器與 VM](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/container_vs_vm.md)
  - [Dockerfile 最佳實踐](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/dockerfile_best_practices.md)
  - [Docker 映像層與優化](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_image_layers.md)
  - [Docker 安全性](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_security.md)
  - [Docker 資源限制](../../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_resource_limits.md)
- **題型**: `故障診斷`, `建置設計`, `供應鏈安全`, `容量取捨`
- **難度**: 9
- **重要程度**: 5
- **建議作答時間**: 30 分鐘
- **標籤**: `Docker`, `Dockerfile`, `Image Layers`, `Supply Chain`, `Cgroups`, `Runtime`
- **Learning Objective IDs**:
  - `concept.docker.build.dockerfile-practices/LO-1`
  - `concept.docker.build.dockerfile-practices/LO-2`
  - `concept.docker.build.dockerfile-practices/LO-3`
  - `concept.docker.runtime.container-vm-isolation/LO-1`
  - `concept.docker.runtime.container-vm-isolation/LO-2`
  - `concept.docker.runtime.container-vm-isolation/LO-3`
  - `concept.docker.build.image-layers-cache/LO-1`
  - `concept.docker.build.image-layers-cache/LO-2`
  - `concept.docker.build.image-layers-cache/LO-3`
  - `concept.docker.security.supply-chain-runtime/LO-1`
  - `concept.docker.security.supply-chain-runtime/LO-2`
  - `concept.docker.security.supply-chain-runtime/LO-3`
  - `concept.docker.runtime.resource-limits/LO-1`
  - `concept.docker.runtime.resource-limits/LO-2`
  - `concept.docker.runtime.resource-limits/LO-3`

## 測驗目標

- 能從 CI build log、image history、digest、registry、runtime event 與 host／container 指標建立事故時間線。
- 能設計可重現、可快取、最小且不洩漏 secret 的 Docker build pipeline。
- 能以 supply-chain provenance、SBOM、非 root、capability 與 runtime limits 判斷發布是否應阻擋。
- 能分辨 container limit、host capacity 與 VM／container 隔離取捨，提出有 headroom 的恢復方案。

## 問題情境與限制條件

某 Go API 映像最近從 180 MB 增至 1.4 GB。CI build 從 3 分鐘變成 18 分鐘，部署時 registry pull timeout；即使成功啟動，production 也出現 P99 latency 上升、container restart 與數個 OOMKilled。安全掃描另外發現 image 中存在疑似 API token，且 container 以 root 執行並被授予過多 capability。

目前 Dockerfile 先 `COPY . .`，再安裝 dependencies、編譯與測試；builder 和 runtime 共用同一個完整 base image。CI 以 floating tag 拉取 base image，沒有記錄 digest、SBOM 或簽章。runtime 設定 CPU quota 偏低、memory limit 接近正常峰值，host 上同時運行多個 noisy neighbor container。團隊想直接提高 limit 並關閉掃描以恢復部署。

限制：不能只用「換更大的機器」或「刪除掃描步驟」作答；必須保留可追溯性、可重現建置與安全發布門檻，並說明短期緩解和長期修復的順序。

## 作答要求

1. **事故定位**：建立 build、registry、啟動與 runtime 的時間線，列出至少八項要查的 image、CI、container、host 與安全證據。
2. **重構 Dockerfile**：設計 multi-stage、合理 layer cache、最小 runtime、非 root 與 build context；說明哪些內容不能寫進 layer。
3. **安全發布門檻**：提出 base image digest、SBOM、漏洞 severity、provenance／signature、secret scanning、capability 與 root policy，定義何時阻擋 artifact promotion。
4. **資源與隔離診斷**：區分 CPU throttling、memory OOM、I/O、host pressure、noisy neighbor 與 container／VM 隔離問題，提出 requests／limits 和 headroom 的校準方法。
5. **恢復計畫**：在不關閉安全門檻的前提下，提出 rollback／pin known-good image、registry cache、分階段 rollout 與驗證指標。
6. **驗證修復**：列出至少六個負載、供應鏈或故障注入測試，證明 build 可重現、secret 不進 image、runtime 不越權且資源壓力可控。

## 期待證據

- 能指出 `COPY . .` 會使 cache 廣泛失效，完整 builder image 不應進 production runtime；image 變大會放大 registry、啟動與漏洞面積。
- 能說明刪除檔案不會從既有 layer 消除 secret，必須輪替已暴露 token 並重建乾淨 image。
- 能以 digest、SBOM、signature／provenance 與掃描結果形成 artifact promotion gate，而不是只看 tag。
- 能把 CPU quota／throttling 與 memory limit／OOM 分開診斷，並保留 host 和 daemon headroom；提高 limit 可能把問題推給 host。
- 能說明 root、Linux capability、Docker socket 與共享 kernel 的 blast radius，依風險判斷 container 是否足夠或需要 VM／更強隔離。
- 能以 image size、cache hit、build time、pull time、restart、OOM、throttled time、P99、漏洞與 secret scan 結果驗證修復。

## 評分規準

| 分數 | 期待表現 |
| :---: | :--- |
| 0 | 方案會繼續發布含 secret、過度權限或不可運行的 image，且無法區分 build 與 runtime 故障。 |
| 1 | 能列出 Dockerfile、layer、scan、limit 等名詞，但沒有可重現 build、artifact gate 或資源證據。 |
| 2 | 能提出部分 multi-stage、非 root 或 limit 修正，但遺漏 layer secret、provenance、CPU／memory 邊界或隔離取捨中的至少一項。 |
| 3 | 能完成可執行的 build 重構、安全 promotion gate、runtime hardening 與資源診斷，並提出 rollback 與驗證指標。 |
| 4 | 除上述內容外，能處理 cache poisoning、base image drift、secret rotation、host pressure、VM 隔離選擇與可量化的 build／pull／runtime 成本。 |

### 通過標準

總分達 **3/4 分**才通過；build reproducibility／artifact safety、runtime security、resource／isolation 三個核心面向均不得低於 2 分。

## 參考答案與詳解

<details>
<summary>顯示參考答案</summary>

先阻擋可疑 image promotion，撤銷／輪替已暴露 token，回滾到已知乾淨且以 digest 固定的 artifact。查 build cache hit、每層大小與 image history、base digest、registry pull、container exit／OOM、CPU throttled time、host memory pressure、capability、root 使用者與漏洞／secret scan 結果。不要以關閉掃描換取短期成功。

Dockerfile 應把 dependency manifest 放在 source 前，使用 multi-stage builder；runtime 只複製編譯後 binary、必要 CA certificates 與設定，使用固定 digest 的最小 base，非 root 執行，縮小 `.dockerignore`。Secret 不進 build context、ARG 或 layer，必要時使用短期 build secret；已進入歷史 layer 的 token 必須輪替。

Promotion gate 應同時驗證 digest／provenance、SBOM、漏洞政策、簽章、非 root、capability 與測試結果。CPU quota 導致 throttling 時會增加延遲但不一定 OOM；memory 超過 limit 可能 OOMKilled；host pressure 和 noisy neighbor 需從 host／container 使用量及 cgroup 指標區分。重新校準 limit 需根據 P95/P99 使用量加 headroom，並保留 host、runtime 與其他 container 的容量。

先以小比例 rollout 驗證 image pull time、startup、P99、restart、OOM、throttled time 與錯誤率，再逐步放量；必要時對高風險 workload 使用 VM 或更強隔離。測試 cache invalidation、重現 build、registry 故障、secret scanning、非 root／capability、CPU／memory pressure 與 host noisy neighbor，確認 artifact 可追溯且 runtime 行為安全。

</details>

## 常見失分點

- 只把 image 壓小，沒有處理 secret 已存在歷史 layer 的事實。
- 用 floating tag 當成可追溯版本，忽略 digest、SBOM、signature 與 provenance。
- 看到 OOM 就無條件提高 memory limit，沒有查 host pressure、正常峰值與 headroom。
- 把 container 和 VM 說成完全相同的隔離邊界，或宣稱非 root 已解決所有 container escape 風險。
- 為恢復速度關閉漏洞掃描、secret scan 或 provenance gate。

## 延伸追問

1. 如果 base image 出現 critical CVE，但尚無修補版本，你會如何設計暫時性例外與到期時間？
2. 如果 registry cache 回傳被污染的 layer，如何驗證 digest、清理 cache 並阻止再次 promotion？
3. 如果 runtime 必須存取硬體或 privileged API，你會如何比較 capability、VM、gVisor 或其他隔離方案？
4. 如果 memory 使用量在尖峰持續成長但沒有立即 OOM，你會如何區分 leak、cache growth 與正常 workload working set？
