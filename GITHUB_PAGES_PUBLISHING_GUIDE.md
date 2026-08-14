# 把 OTM Value Driver Library 发布到 GitHub：零代码操作指南

这份指南的目标是把当前网站放到你的 GitHub 帐号，并让任何人通过一个 `github.io` 网址查看它。你**不需要打开代码、不需要安装软件，也不需要在电脑上运行任何指令**。

> **你将得到的网址格式：** `https://你的GitHub用户名.github.io/otm-value-driver-library/`

例如，若 GitHub 用户名是 `alex-chen`，网站网址会是：`https://alex-chen.github.io/otm-value-driver-library/`。

## 先选择发布方式

| 方式 | 网址 | 适合什么情况 | 你需要做什么 |
|---|---|---|---|
| **方式 A：继续使用当前公开网址** | `https://otmvaldriv-n3maueuh.manus.space` | 你只想马上把链接发给别人，不在意网址是不是 GitHub。 | 什么都不用做，直接复制链接。 |
| **方式 B：GitHub Pages（推荐）** | `https://你的用户名.github.io/otm-value-driver-library/` | 你想让代码由自己的 GitHub 帐号管理，并用 GitHub 网址展示网站。 | 按下面四步操作；首次约需 10–15 分钟。 |

以下内容讲的是**方式 B**。本项目已预先放入自动发布设置，因此你不需要编辑或理解任何代码。

## 开始前，只确认两件事

第一，请确认你能登录自己的 GitHub 帐号。第二，请接受：如果你使用免费 GitHub 帐号，仓库需要设为 **Public（公开）**；这代表其他人既可以访问网站，也可以看到网站代码。[1]

因此，不要在网站文字、文件名或代码里写入客户姓名、客户数据、账号密码、API key、报价、内部文件或任何机密信息。GitHub Pages 发布的是静态网站，适合现在这种只展示框架和交互内容的网站；它不适合放需要登录、数据库或敏感客户资料的工具。[2]

## 第 1 步：从当前项目导出到 GitHub

在当前工作区的右侧，打开 **Management UI（管理面板）**。然后按以下路径操作：

1. 点击右侧管理面板中的 **Settings（设置）**。
2. 在左侧选择 **GitHub**。
3. 如果这是第一次连接，点击连接 GitHub；按 GitHub 弹出的页面登录，并同意授权。
4. 回到管理面板后，选择你的 GitHub 帐号作为 **Owner（拥有者）**。
5. 在 Repository name（仓库名称）填写：`otm-value-driver-library`。
6. 选择 **Public（公开）**。
7. 点击导出或创建仓库。等待看到成功提示。

导出完成后，点击提示中的 GitHub 链接。你会进入一个新的 GitHub 仓库页面。先确认页面顶部显示的仓库名是 `otm-value-driver-library`，并且你能在文件列表中看到 `.github`、`client`、`package.json` 等文件夹或文件。你不需要打开其中任何一个文件。

## 第 2 步：在 GitHub 打开 Pages 发布功能

现在仍在刚才打开的 GitHub 仓库页面，请按以下步骤操作：

1. 点击仓库顶部的 **Settings（设置）**。如果顶部没有直接看到 Settings，先点击靠近右上方的下拉菜单，再选择 Settings。
2. 在左侧栏找到 **Code and automation（代码和自动化）**。
3. 点击里面的 **Pages**。
4. 在 **Build and deployment（构建和部署）** 区域，找到 **Source（来源）**。
5. 从下拉菜单中选择 **GitHub Actions**。**不要选择** `Deploy from a branch`。

为什么选择 GitHub Actions？这个网站是 React/Vite 网站，发布前必须先自动“打包”成浏览器可读的静态文件。当前项目已经准备好此步骤；选择 GitHub Actions 后，GitHub 会在每次代码更新时自动完成它。[3]

## 第 3 步：等待自动发布完成

选择 GitHub Actions 后，点击仓库顶部的 **Actions** 标签。你会看到名为 **Deploy website to GitHub Pages** 的工作流。

首次执行时，通常会先显示黄色转动图标；请等待它变成绿色勾选。多数情况下只需几分钟，但 GitHub 官方说明首次发布或更新可能需要最长约 10 分钟。[2]

| 你看到的状态 | 它的意思 | 你要做什么 |
|---|---|---|
| 黄色圆点或转动图标 | GitHub 正在自动准备并发布网站。 | 等待，不需要点击代码。 |
| 绿色勾选 | 发布成功。 | 进入下一步，取得网址。 |
| 红色叉号 | 自动发布有问题。 | 打开失败的工作流，截一张最上面的错误画面发给我。 |

## 第 4 步：取得并验证你的公开网址

回到仓库的 **Settings → Pages** 页面。页面会出现 **Visit site（访问网站）** 按钮；点击它，就会打开你的公开网站。

你的网址通常会是：

```text
https://你的GitHub用户名.github.io/otm-value-driver-library/
```

请把这个网址复制到浏览器的无痕/隐私窗口，或发给一位同事测试。如果对方不需要登录 GitHub 也能打开首页，就说明发布成功。

## 以后怎样更新网站

当你在这里让我更新网站时，先让我保存一个新版本。之后重新打开管理面板中的 **Settings → GitHub**，将更新后的项目导出/同步到**同一个** GitHub 仓库。代码推送到 GitHub 后，Actions 会再次自动发布；你不需要重新做 Pages 设置。若管理面板只显示“创建新仓库”，不要新建第二个同名仓库，先把页面截图发给我，我会带你完成更新路径。

## 三个最常见的问题

### 1. 打开网址看到 404

先回到 GitHub 仓库的 **Settings → Pages**，确认 Source 是 **GitHub Actions**。然后打开 **Actions**，确认最新的 **Deploy website to GitHub Pages** 是绿色勾选。GitHub 项目网站的正确网址必须包含仓库名：`/otm-value-driver-library/`。[1] [2]

### 2. GitHub 提示仓库不是 Public

如果你使用免费 GitHub 帐号，请在创建仓库时选 **Public**。GitHub 官方规定，GitHub Free 个人帐户或组织帐户下的 Pages 仓库需为公开仓库。[1]

### 3. 网站打开了，但图像没有显示

当前网站的四张自定义图像由当前公开项目提供。因此，发布后请**不要删除或关闭当前 Manus 项目**；它继续为 GitHub Pages 网站提供这些图像。以后如果你希望完全独立于此项目，我可以帮你把这些图像迁移到你的 GitHub 仓库或你自己的图片存储中。

## 重要提醒

GitHub Pages 是公开互联网服务。即使未来你使用付费计划把仓库设为 private，已发布的网站若设置为公开仍可被任何人访问。[1] 发布前请再次检查是否含有客户名称、业务数据或其他不应公开的信息。

## 官方参考资料

[1] [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

[2] [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

[3] [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
