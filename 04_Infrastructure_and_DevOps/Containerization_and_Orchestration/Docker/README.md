# Docker

Docker 是最流行的容器化平台，徹底改變了軟體的開發、部署和維運方式。作為資深後端工程師，您需要深入理解 Docker 的核心概念、底層原理、網路模型以及在生產環境中的最佳實踐。本章節涵蓋了面試中最常被考察的 Docker 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [容器 (Container) vs. 虛擬機 (VM)：有什麼區別？](./container_vs_vm.md) | 4 | 5 | `Docker`, `Container`, `VM`, `Comparison` |
| 2 | [Dockerfile, Image, Container, Registry：它們是什麼關係？](./dockerfile_image_container_registry.md) | 5 | 5 | `Docker`, `Dockerfile`, `Image`, `Container` |
| 3 | [Docker 網路模型：Bridge、Host、Overlay](./docker_networking.md) | 6 | 4 | `Docker`, `Networking`, `Bridge`, `Overlay` |
| 4 | [Docker Volume 與資料持久化](./docker_volume.md) | 5 | 5 | `Docker`, `Volume`, `Storage` |
| 5 | [Dockerfile 最佳實踐與多階段建置](./dockerfile_best_practices.md) | 6 | 5 | `Docker`, `Dockerfile`, `Best Practices` |
| 6 | [Docker Compose：多容器應用編排](./docker_compose.md) | 5 | 4 | `Docker`, `Docker Compose`, `Multi-container` |
| 7 | [Docker 底層原理：Namespace 與 Cgroups](./docker_internals.md) | 8 | 4 | `Docker`, `Namespace`, `Cgroups`, `Internals` |
| 8 | [Docker 映像層 (Layer) 與快取機制](./docker_image_layers.md) | 6 | 4 | `Docker`, `Image`, `Layer`, `Cache` |
| 9 | [Docker 安全性最佳實踐](./docker_security.md) | 7 | 5 | `Docker`, `Security`, `Best Practices` |
| 10 | [Docker 資源限制：CPU、Memory、IO](./docker_resource_limits.md) | 6 | 4 | `Docker`, `Resource`, `Limits` |

---

## 學習建議

1.  **理解容器化概念**: 容器與虛擬機的差異是理解 Docker 價值的基礎。
2.  **掌握核心元件**: Dockerfile、Image、Container、Registry 之間的關係必須清晰理解。
3.  **熟悉網路模型**: Bridge、Host、Overlay 等網路模式各有適用場景。
4.  **實踐最佳實踐**: 多階段建置、層快取優化、安全掃描是生產環境的關鍵技能。
5.  **學習編排工具**: Docker Compose、Kubernetes 等編排工具是大規模部署的必備知識。
