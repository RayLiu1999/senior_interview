# NuGet 套件管理與 dotnet CLI

- **難度**: 4
- **重要程度**: 4
- **標籤**: `NuGet`, `dotnet CLI`, `Package Management`, `.NET`, `C#`

## 問題詳述

dotnet CLI 是 .NET 開發的核心命令列工具，NuGet 是 .NET 的官方套件管理系統。理解這兩者的使用方式、套件版本管理策略以及 `.csproj` 專案檔結構，是 C# 後端工程師的基礎工程素養。

## 核心理論與詳解

### dotnet CLI 核心命令

**專案管理：**

```bash
# 建立新專案（使用範本）
dotnet new webapi -n MyService --use-controllers
dotnet new console -n MyTool
dotnet new classlib -n MyLibrary
dotnet new xunit -n MyService.Tests

# 解決方案管理
dotnet new sln -n MySolution
dotnet sln add MyService/MyService.csproj           # 加入專案至解決方案
dotnet sln add MyService.Tests/MyService.Tests.csproj

# 構建與執行
dotnet build                    # 編譯
dotnet build -c Release         # Release 模式構建
dotnet run                      # 執行（開發用）
dotnet run --project src/MyService
dotnet watch run                # 熱重載（修改程式碼自動重啟）

# 測試
dotnet test                     # 執行所有測試
dotnet test --filter "Category=Unit"    # 按分類過濾
dotnet test --collect:"XPlat Code Coverage"  # 收集覆蓋率

# 發布
dotnet publish -c Release -r linux-x64 --self-contained false
dotnet publish -c Release -r linux-x64 --self-contained true  # 包含 .NET Runtime
```

**工具管理：**

```bash
# 全域工具
dotnet tool install -g dotnet-ef            # 安裝 EF Core CLI 工具
dotnet tool install -g dotnet-format        # 程式碼格式化工具
dotnet tool list -g                         # 列出已安裝的全域工具
dotnet tool update -g dotnet-ef

# 本地工具（推薦用於 CI/CD）
dotnet new tool-manifest                    # 建立 .config/dotnet-tools.json
dotnet tool install dotnet-ef              # 安裝為本地工具（記錄在 manifest）
dotnet tool restore                        # 還原所有本地工具（CI 環境用）
```

### NuGet 套件管理

**安裝與移除：**

```bash
# 新增套件
dotnet add package Newtonsoft.Json
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.0
dotnet add package Serilog.AspNetCore --prerelease

# 移除套件
dotnet remove package Newtonsoft.Json

# 列出已安裝套件
dotnet list package
dotnet list package --outdated              # 列出可升級的套件
dotnet list package --vulnerable           # 列出有已知漏洞的套件（重要！）

# 還原套件（通常在 CI/CD 中執行）
dotnet restore
```

**版本範圍語法：**

```xml
<!-- csproj 中的版本控制語法 -->
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />   <!-- 精確版本 -->
<PackageReference Include="Serilog" Version="[3.0,4.0)" />         <!-- 範圍：3.x -->
<PackageReference Include="Polly" Version="8.*" />                  <!-- 通配符 -->
```

### .csproj 專案檔詳解

.csproj 是 .NET 的 XML 格式專案描述文件，等同於 Java 的 `pom.xml` / `build.gradle`：

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">  <!-- SDK 類型：Web API 使用此 SDK -->

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>    <!-- 目標框架 -->
    <Nullable>enable</Nullable>                  <!-- 啟用可空性分析（強烈建議）-->
    <ImplicitUsings>enable</ImplicitUsings>      <!-- 自動引入常用命名空間 -->
    <RootNamespace>MyCompany.MyService</RootNamespace>
    <AssemblyVersion>1.2.0</AssemblyVersion>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>  <!-- CI/CD 推薦 -->
  </PropertyGroup>

  <ItemGroup>
    <!-- 套件依賴 -->
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />

    <!-- 測試專用套件（不打包進生產 DLL）-->
    <PackageReference Include="xunit" Version="2.7.0">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <!-- 項目間引用（Multi-Project Solution）-->
    <ProjectReference Include="../MyService.Core/MyService.Core.csproj" />
    <ProjectReference Include="../MyService.Infrastructure/MyService.Infrastructure.csproj" />
  </ItemGroup>

</Project>
```

### NuGet 私有套件來源（Private Registry）

企業內部通常搭建 Azure Artifacts 或 Nexus 作為 NuGet 私有來源：

```xml
<!-- NuGet.Config（放在專案根目錄，受版本控制）-->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <!-- 添加私有 NuGet 來源 -->
    <add key="Company Nexus" value="https://nexus.company.com/repository/nuget-group/" />
    <!-- 保留官方 nuget.org -->
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
  </packageSources>
  <activePackageSource>
    <add key="All" value="(Aggregate source)" />
  </activePackageSource>
</configuration>
```

在 CI/CD 環境中使用認證：

```bash
# GitHub Actions 中授權私有 NuGet 來源
dotnet nuget add source "https://nuget.pkg.github.com/MY_ORG/index.json" \
  --name "GitHub Packages" \
  --username "$GITHUB_ACTOR" \
  --password "${{ secrets.GITHUB_TOKEN }}" \
  --store-password-in-clear-text
```

### 解決方案結構最佳實踐

```
MySolution/
├── MySolution.sln
├── src/
│   ├── MyService.API/              # ASP.NET Core Web API（Controller, Middleware）
│   │   └── MyService.API.csproj
│   ├── MyService.Application/      # Use Cases, DTOs, 應用服務
│   │   └── MyService.Application.csproj
│   ├── MyService.Domain/           # Entities, Value Objects, Domain Services（零依賴）
│   │   └── MyService.Domain.csproj
│   └── MyService.Infrastructure/   # Repository 實現, DB Context, 外部 API 客戶端
│       └── MyService.Infrastructure.csproj
└── tests/
    ├── MyService.Unit.Tests/       # 單元測試
    └── MyService.Integration.Tests/ # 整合測試
```

依賴方向：`API → Application → Domain` （Infrastructure 實現 Domain 的介面）

### 程式碼分析（Code Analysis）

.NET 內建分析器可以在編譯期間捕捉問題：

```xml
<PropertyGroup>
  <!-- 啟用 .NET 分析器（.NET 5+ 預設啟用）-->
  <EnableNETAnalyzers>true</EnableNETAnalyzers>
  <AnalysisMode>All</AnalysisMode>         <!-- 啟用所有規則 -->
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>

<ItemGroup>
  <!-- 第三方分析器：StyleCop 代碼風格 -->
  <PackageReference Include="StyleCop.Analyzers" Version="1.2.0-beta.507">
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
    <PrivateAssets>all</PrivateAssets>
  </PackageReference>

  <!-- SonarAnalyzer 代碼品質 -->
  <PackageReference Include="SonarAnalyzer.CSharp" Version="9.26.0.92422">
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
    <PrivateAssets>all</PrivateAssets>
  </PackageReference>
</ItemGroup>
```
