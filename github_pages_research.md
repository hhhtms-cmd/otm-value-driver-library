# GitHub Pages 发布依据

## 已核实的规则

GitHub Pages 是直接从 GitHub 仓库中的 HTML、CSS 和 JavaScript 静态文件发布网站的托管服务。对于普通项目仓库，默认网址通常为 `https://<GitHub 用户名>.github.io/<仓库名>/`。用户或组织主站才要求仓库名为 `<用户名>.github.io`。

GitHub 官方支持两种发布源：从一个分支的根目录或 `/docs` 目录发布，或使用 GitHub Actions 工作流。对于这个 React/Vite 项目，需先由构建过程生成静态文件，故应选择 GitHub Actions；将源代码直接作为“Deploy from a branch”的发布源不能正确构建项目。

GitHub Free / GitHub Free for organizations 的仓库必须为 Public，才能创建 GitHub Pages 站点。GitHub Pages 站点会公开可访问；发布之前不可把密钥、密码、客户数据等提交到仓库。Pages 可使用 GitHub 默认域名或自定义域名。官方提示部署或更新最多可能需要 10 分钟。

## 官方来源

1. https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
2. https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
3. https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages

## 访问日期

2026-08-14
