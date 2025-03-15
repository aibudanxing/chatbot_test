# 智能客服聊天系统

## 项目概述

本项目是一个基于扣子平台（Coze）API的智能客服聊天系统，提供了一个简洁直观的Web界面，使用户能够与智能客服助手进行自然语言交互。系统通过调用扣子平台的API，实现了会话创建、消息发送和接收智能回复等功能。

## 功能特点

- **实时对话**：用户可以通过简洁的界面与智能客服助手进行实时对话
- **流式响应**：采用流式响应技术，实时显示AI回复内容，提升用户体验
- **会话管理**：自动创建和维护会话，保持对话上下文连贯性
- **错误处理**：内置错误处理和重试机制，提高系统稳定性
- **响应式设计**：适配不同设备屏幕尺寸的界面设计

## 技术架构

### 前端技术

- **HTML5/CSS3**：构建用户界面和样式
- **JavaScript**：实现客户端逻辑和API交互
- **Fetch API**：处理HTTP请求和响应
- **Stream API**：处理流式响应数据

### 后端服务

- **扣子平台API**：提供智能对话能力
  - 会话创建API
  - 消息创建API
  - 对话发起API（流式响应）

## 文件结构

- **index.html**：主页面HTML结构
- **style.css**：样式表文件
- **app.js**：JavaScript主逻辑文件
- **api调用.md**：API调用文档和示例
- **logs/**：存储HTTP服务器访问日志的文件夹

## 安装与部署

1. 克隆或下载项目代码到本地服务器
2. 确保服务器支持静态文件托管
3. 配置app.js中的API令牌和Bot ID：
   ```javascript
   const API_TOKEN = '您的API令牌';
   const BOT_ID = '您的Bot ID';
   ```
4. 使用HTTP服务器（如Python的http.server、Node.js的http-server等）启动项目

### 使用Python启动服务器示例

```bash
python -m http.server 8000 > ./logs/access.log 2>&1
```

然后在浏览器中访问：http://localhost:8000

## 使用说明

1. 打开浏览器访问部署好的网页
2. 在输入框中输入您的问题或需求
3. 点击"发送

## 日志管理

系统会自动将HTTP服务器的访问日志保存到`logs/access.log`文件中，方便您查看和分析访问情况。日志记录的内容包括：

- **服务器启动信息**：记录服务器启动时间和监听的端口号
- **GET请求详情**：记录所有GET请求的路径、客户端IP地址、HTTP状态码等信息
- **POST请求详情**：记录POST请求的路径、客户端IP地址、请求数据内容和HTTP状态码

日志格式示例：
```
2025-03-15 00:13:32 - 服务器启动在端口 8000，访问 http://localhost:8000/
2025-03-15 00:13:41 - GET请求: /?ide_webview_request_time=1741968821494
2025-03-15 00:13:41 - 127.0.0.1 - "GET /?ide_webview_request_time=1741968821494 HTTP/1.1" 200 -
```

您可以通过以下方式查看日志：

```bash
# 查看完整日志
cat ./logs/access.log

# 实时查看日志更新
tail -f ./logs/access.log
```