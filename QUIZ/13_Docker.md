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

<a id="q6"></a>
### Q6: Docker 網路模式如何影響隔離、服務發現與暴露面？
<!-- Concept ID: concept.docker.networking.mode-isolation; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較自訂 bridge、host、overlay 與 macvlan，並說明 port publishing、DNS、NAT 和網路分段如何共同決定可達性。

<details>
<summary>💡 答案提示</summary>

- 自訂 bridge 提供單主機隔離與容器名稱解析；host 幾乎取消網路命名空間隔離；overlay 用於跨主機服務通信；macvlan 讓容器出現在實體網路但管理與相容性成本較高。
- `-p` 是對外發布與 NAT，不等於容器間服務發現；內部服務應使用明確的自訂網路與最小暴露端口。
- 排查連線問題要同時查看 network inspect、DNS、路由、iptables／NAT、容器端口監聽與網路延遲，不能只互 ping。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_networking.md)

<a id="q7"></a>
### Q7: Docker Compose 如何管理多容器服務的依賴與資料邊界？
<!-- Concept ID: concept.docker.compose.service-topology; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明 `services`、`depends_on`、healthcheck、networks、volumes、profiles 與資源限制的責任，並指出 Compose 不等於多主機編排。

<details>
<summary>💡 答案提示</summary>

- `depends_on` 主要描述建立／啟動依賴；只有搭配健康檢查與應用層 retry 才能處理「服務已啟動但尚未可用」。
- Compose network 提供服務名稱解析，named volume 的生命週期獨立於容器；敏感設定應透過受控注入，不能把 secret 寫入 image 或版本庫。
- Compose 適合單主機開發、測試與小型部署；高可用、多節點調度、滾動更新與自我修復需要更完整的編排平台。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_compose.md)

<a id="q8"></a>
### Q8: Docker 的 Namespace、Cgroups、Union Filesystem 與 Runtime 如何共同運作？
<!-- Concept ID: concept.docker.runtime.namespace-cgroup; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🔴 必考

請從程序、網路、掛載、使用者隔離、資源限制、映像層與 containerd／OCI runtime 的角度建立容器啟動模型。

<details>
<summary>💡 答案提示</summary>

- Namespaces 提供程序看到的資源視圖隔離，cgroups 控制 CPU、memory、I/O 與 PID 等資源；兩者都不是獨立 guest kernel 的 VM 邊界。
- Union／Overlay filesystem 以唯讀 image layers 加上可寫 container layer 運作；大量寫入或錯誤的 layer 設計會影響 I/O 與儲存成本。
- `dockerd`、containerd、runc／其他 OCI runtime 的責任不同；除錯要把 runtime event、cgroup pressure、namespace、mount 與應用症狀對齊。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_internals.md)

<a id="q9"></a>
### Q9: Docker Volume、Bind Mount 與 tmpfs 應如何選擇？
<!-- Concept ID: concept.docker.storage.volume-lifecycle; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請比較三種掛載方式的生命週期、效能、可攜性、權限與備份還原風險，並為資料庫、配置和暫存資料提出選擇。

<details>
<summary>💡 答案提示</summary>

- Named volume 由 Docker 管理且與容器生命週期分離，適合持久資料；bind mount 直接暴露 host 路徑，適合開發或明確的主機整合；tmpfs 在記憶體中且重啟即失。
- 資料庫要驗證一致性備份、權限、容量告警與還原演練，不能只複製正在寫入的目錄。
- `:ro` 能縮小配置掛載的寫入面；刪除容器不代表 named volume 已備份，也不代表 bind mount 的 host 資料會自動回收。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/docker_volume.md)

<a id="q10"></a>
### Q10: Dockerfile、Image、Container 與 Registry 如何形成可重現的交付鏈？
<!-- Concept ID: concept.docker.build.image-container-registry; Learning Objective IDs: LO-1, LO-2, LO-3 -->

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請從定義、建置、執行、推送與拉取說明四者關係，並區分 mutable tag、immutable digest、layer cache 和 provenance。

<details>
<summary>💡 答案提示</summary>

- Dockerfile 是建置指令，image 是不可變的分層產物，container 是 image 的可執行實例，registry 負責分發和保存 image manifest／layers。
- Tag 方便人讀但可能漂移；部署與回滾應記錄 digest、來源 commit、建置器與掃描／簽章結果。
- 可重現建置要固定 base image 與依賴、控制 build context、避免 secret 進入 layer，並以 clean pull／inspect 驗證實際執行產物。

</details>

📖 [查看完整答案](../04_Infrastructure_and_DevOps/Containerization_and_Orchestration/Docker/dockerfile_image_container_registry.md)
