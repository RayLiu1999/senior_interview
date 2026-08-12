# Docker - 重點考題 (Quick Quiz)

> 這份考題聚焦容器隔離、Dockerfile、映像層與 cache、供應鏈安全及資源限制。

## 🐳 Container Build 與 Runtime

<a id="q1"></a>
### Q1: Container 與 VM 的隔離和資源取捨是什麼？
<!-- Concept ID: concept.docker.runtime.container-vm-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請從 kernel、啟動速度、資源密度、隔離強度與 workload 相容性比較兩者。

<details>
<summary>💡 答案提示</summary>

- Container 共享 host kernel，透過 namespaces、cgroups 等機制隔離；VM 有獨立 guest kernel，隔離邊界較強但成本較高。
- Container 適合快速部署與高密度無狀態服務；VM 適合不同 kernel、較強隔離或 legacy workload。
- 容器不是安全邊界的絕對替代品，仍要控制 capability、root 權限與資源競爭。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/container_vs_vm.md)

<a id="q2"></a>
### Q2: 如何寫出可重現、快速且較安全的 Dockerfile？
<!-- Concept ID: concept.docker.build.dockerfile-practices; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明多階段建置、layer 順序、build context、非 root 與 runtime image 的設計。

<details>
<summary>💡 答案提示</summary>

- 先複製穩定的 dependency manifest，再安裝依賴，最後複製頻繁變動的 source，以提升 cache hit。
- Multi-stage build 把 compiler、package manager 與測試工具留在 builder，runtime 只保留必要 artifact。
- 固定 base image digest、縮小 context、避免把 secret 寫入 layer，並以非 root 使用者執行。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/dockerfile_best_practices.md)

<a id="q3"></a>
### Q3: Docker image layer 與 build cache 為什麼會影響部署成本？
<!-- Concept ID: concept.docker.build.image-layers-cache; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋 layer、digest、cache invalidation、image pull 與 secret 洩漏的關係。

<details>
<summary>💡 答案提示</summary>

- 每個 Dockerfile 指令可能產生唯讀 layer；內容變更會影響後續 cache，造成重新 build 或重新 pull。
- 小而穩定的 base layer、合理指令順序與 registry cache 可以降低 CI 時間與網路成本。
- 刪除檔案不等於從歷史 layer 消除 secret；secret 不應進入 build context 或 image layer。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_image_layers.md)

<a id="q4"></a>
### Q4: 如何建立 Docker image 與 container 的供應鏈安全？
<!-- Concept ID: concept.docker.security.supply-chain-runtime; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請從 base image、dependency、SBOM、簽章、非 root、capability 與 runtime secret 說明防護。

<details>
<summary>💡 答案提示</summary>

- 固定且可追溯的 base image digest，產生 SBOM、執行漏洞掃描並在高風險漏洞或 provenance 不符時阻擋發布。
- 以非 root、read-only filesystem、最小 Linux capabilities 與不掛載 Docker socket 降低 blast radius。
- Secret 在 runtime 透過受控機制注入，不要在 Dockerfile、build arg 或 layer 寫入。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_security.md)

<a id="q5"></a>
### Q5: Docker CPU／Memory limits 如何避免 noisy neighbor？
<!-- Concept ID: concept.docker.runtime.resource-limits; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請區分 CPU throttling、Memory OOM、I/O 限制與 host 資源不足，並說明如何用指標校準限制。

<details>
<summary>💡 答案提示</summary>

- CPU limit 可能造成 throttling；memory limit 超過通常會觸發 OOM，兩者對延遲和恢復的行為不同。
- 容器 limit 不能超過 host 實際可提供的容量；仍要保留 kernel、daemon 與其他服務的 headroom。
- 觀察 usage、throttled time、OOM events、I/O latency、host pressure 與 container restart，不能只看平均 CPU。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_resource_limits.md)
