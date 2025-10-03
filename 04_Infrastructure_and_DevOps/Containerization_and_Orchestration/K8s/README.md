# Kubernetes (K8s)

Kubernetes 是最流行的容器編排平台，已成為雲原生應用部署的事實標準。作為資深後端工程師，您需要深入理解 K8s 的核心概念、架構設計、資源管理以及在生產環境中的最佳實踐。本章節涵蓋了面試中最常被考察的 Kubernetes 核心主題。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [什麼是 Kubernetes？它解決了什麼問題？](./what_is_kubernetes.md) | 4 | 5 | `Kubernetes`, `Container Orchestration`, `Cloud Native` |
| 2 | [Kubernetes 核心架構：Master 與 Worker Node](./kubernetes_architecture.md) | 6 | 5 | `Kubernetes`, `Architecture`, `Master`, `Node` |
| 3 | [Pod 是什麼？為什麼需要 Pod？](./what_is_pod.md) | 5 | 5 | `Kubernetes`, `Pod`, `Container` |
| 4 | [Deployment vs. StatefulSet vs. DaemonSet](./deployment_statefulset_daemonset.md) | 7 | 5 | `Kubernetes`, `Deployment`, `StatefulSet`, `DaemonSet` |
| 5 | [Service 的類型：ClusterIP、NodePort、LoadBalancer](./kubernetes_service_types.md) | 6 | 5 | `Kubernetes`, `Service`, `Networking` |
| 6 | [ConfigMap 與 Secret 的使用](./configmap_and_secret.md) | 5 | 5 | `Kubernetes`, `ConfigMap`, `Secret`, `Configuration` |
| 7 | [Liveness Probe、Readiness Probe 與 Startup Probe](./kubernetes_probes.md) | 6 | 5 | `Kubernetes`, `Health Check`, `Probe` |
| 8 | [Kubernetes 網路模型與 CNI](./kubernetes_networking.md) | 7 | 4 | `Kubernetes`, `Networking`, `CNI` |
| 9 | [Ingress 與 Ingress Controller](./kubernetes_ingress.md) | 6 | 5 | `Kubernetes`, `Ingress`, `Load Balancer` |
| 10 | [Persistent Volume (PV)、Persistent Volume Claim (PVC) 與 StorageClass](./kubernetes_storage.md) | 6 | 4 | `Kubernetes`, `Storage`, `PV`, `PVC` |
| 11 | [資源管理：Requests、Limits 與 ResourceQuota](./kubernetes_resource_management.md) | 6 | 5 | `Kubernetes`, `Resource Management`, `QoS` |
| 12 | [Horizontal Pod Autoscaler (HPA) 與 Vertical Pod Autoscaler (VPA)](./kubernetes_autoscaling.md) | 7 | 4 | `Kubernetes`, `Auto Scaling`, `HPA`, `VPA` |
| 13 | [Namespace 與 RBAC 權限管理](./kubernetes_namespace_rbac.md) | 7 | 4 | `Kubernetes`, `Namespace`, `RBAC`, `Security` |
| 14 | [Rolling Update 與 Rollback 策略](./kubernetes_rolling_update.md) | 5 | 5 | `Kubernetes`, `Deployment`, `Rolling Update`, `Rollback` |

---

## 學習建議

1.  **掌握核心概念**: Pod、Deployment、Service、ConfigMap 是 K8s 的基礎，必須深入理解其設計理念。
2.  **理解架構設計**: Master-Worker 架構、etcd、API Server、Controller Manager 等組件的職責和交互。
3.  **熟悉網路模型**: K8s 的網路模型、Service 的實現原理、Ingress 的路由機制是面試高頻考點。
4.  **實踐資源管理**: Requests/Limits、HPA/VPA、資源配額等是保證集群穩定運行的關鍵。
5.  **關注生產實踐**: 健康檢查、滾動更新、監控告警、日誌收集等是生產環境的必備知識。
