# OAuth访问令牌: 

1. 获取令牌
- 终端用户在 Web 应用程序中触发授权操作，例如点击授权按钮。该动作对应扣子发起对话 API，应用程序需要获得扣子账号的授权。
- Web 应用程序重定向用户到授权服务器以获取 code。应用程序通过302重定向方式发起“获取授权页面URL” API请求。请求中携带 OAuth 应用的客户端 ID 和客户端密钥 、重定向 URL 等信息。请求示例如下：
curl --location --request GET 'https://www.coze.cn/api/permission/oauth2/authorize?response_type=code&client_id=8173420653665306615182245269****.app.coze&redirect_uri=https://www.coze.cn/open/oauth/apps&state=1294848'
上面Response Header 中的 location 字段中为跳转链接。例如https://www.coze.cn/oauth/consent?authorize_key=JacVeqTW93ps5m5N9n349bEBgIsWrnNp。浏览器跳转到此 URL，引导用户完成扣子账号授权。
- 扣子服务端会在 API 的响应中返回 code。
从重定向的 URL 地址中获取 code，例如本示例中 code 为 code_WZmPRDcjJhfwHD****。
https://www.coze.cn/open/oauth/apps?code=code_WZmPRDcjJhfwHD****&state=1294848
- 使用授权码交换访问令牌。
应用程序向扣子服务端发起 获取 OAuth Access Token 请求，请求中携带 code，扣子服务端会在 API 的响应中返回 access_token 和 refresh_token。其中：
access_token 即访问令牌，用于发起扣子 API 请求时鉴权，有效期为 15 分钟。
refresh_token 用于刷新 access_token，有效期为 30 天。refresh_token 到期前可以多次调用 刷新 OAuth Access Token 接口获取新的 refresh_token 和 access_token。
接口请求示例：
curl --location --request POST 'https://api.coze.cn/api/permission/oauth2/token' \
--header 'Authorization: Bearer hDPU8gexPcwChkhMvmjvR14yQ1HWoaB42tCd0rjrc55G****' \
--header 'Content-Type: application/json' \
--data '{
    "grant_type": "authorization_code",
    "client_id": "8173420653665306615182245269****.app.coze",
    "redirect_uri": "https://www.coze.cn/open/oauth/apps",
    "code": "bfiqrhedxsdvnuivher****"
}'
接口返回示例
{
    "access_token": "czu_UEE2mJn66h0fMHxLCVv9uQ7HAoNNS8DmF6N6grjWmkHX2jPm8SR0tJcKop8v****",
    "expires_in": 1720098388,
    "refresh_token": "LBEP9iWU7rn60PWa58GER5rr6vygb5WSACu2vASlCQu7kpFkavCrNa9BBDpHLUlGd46a****"
}
- 在 API 请求头中通过 Authorization=Bearer $Access_Token 指定访问令牌，发起扣子 API 请求。

# 发起扣子api请求时的相关配置参数
1. Bot_id:  7478675888952246323

2. space_id: 7474950376467578890

3. client_type : web
client_id : 95217656897251911813078589074212.app.coze
coze_www_base : https://www.coze.cn
coze_api_base : https://api.coze.cn
client_secret : SLXzmSQA9t7O4ahHMgR5pt0QUrpisjr95BbpDWPJvoIxAvAc
redirect_uris {2}
0 : https://aibudanxing.github.io/chatbot_test
1 : http://127.0.0.1:8080/callback


# 创建会话
创建一个会话。​
会话是智能体和用户之间的一段问答交互，一个会话包含一条或多条消息。会话、对话和消息的概念说明，可参考​基础概念。​
​
1. 请求方式​：POST​
2. 请求地址​
 https://api.coze.cn/v1/conversation/create​

3. 请求示例：
curl --location --request POST 'https://api.coze.cn/v1/conversation/create' \
--header 'Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****' \
--header 'Content-Type: application/json' \
--data-raw '{
    "meta_data": {
        "uuid": "newid1234"
    },
   "messages": [
        {
            "role": "user",
            "content":"[{\"type\":\"text\",\"text\":\"你好，这是我的图片\"},{\"type\":\"image\",\"file_id\":\"{{FILE_ID}}\"}]",
            "content_type":"object_string"
        },
        {
            "role": "assistant",
            "content": "你好我是一个bot",
            "content_type":"text"
        }
    ]
}'

4. 返回示例：
{
    "code": 0,
    "data": {
        "created_at": 1718289297,
        "id": "737999610479815****",
        "meta_data": {
            "uuid": "newid1234"
        }
    },
    "msg": ""
}

# 查看会话信息
通过会话 ID 查看会话信息。​​
​
1. 请求方式​
GET​
2. 请求地址​
​
 https://api.coze.cn/v1/conversation/retrieve

3. 请求示例
curl --location --request GET 'https://api.coze.cn/v1/conversation/retrieve?conversation_id=737989918257****' \
--header 'Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****' \
--header 'Content-Type: application/json' \

4. 返回示例
{
    "code": 0,
    "data": {
        "created_at": 1718266724,
        "id": "737989918257813****",
        "meta_data": {}
    },
    "msg": ""
}


# 创建消息
创建一条消息，并将其添加到指定的会话中。​
消息在服务端的保存时长为 180 天，到期后自动删除。你也可以调用​删除消息接口，手动从会话中删除消息。​
​
1. 请求方式​
POST​
2. 请求地址​
 https://api.coze.cn/v1/conversation/message/create​
3. 请求示例
curl --location --request POST 'https://api.coze.cn/v1/conversation/message/create?conversation_id=737363834493434****' \
--header 'Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****' \
--header 'Content-Type: application/json' \
--data-raw '{
    "role": "user",
    "content": "早上好，今天星期几",
    "content_type": "text"
}'
4. 返回示例
{
    "code": 0,
    "data": {
        "bot_id": "",
        "chat_id": "",
        "content": "早上好，今天星期几？",
        "content_type": "text",
        "conversation_id": "737999610479815****",
        "created_at": 1718592898,
        "id": "738130009748252****",
        "meta_data": {},
        "role": "user",
        "type": "",
        "updated_at": "1718592898"
    },
    "msg": ""
}


# 发起对话
调用此接口发起一次对话，支持添加上下文和流式响应。​
会话、对话和消息的概念说明，可参考​基础概念。​

1. 接口说明​
发起对话接口用于向指定智能体发起一次对话，支持在对话时添加对话的上下文消息，以便智能体基于历史消息做出合理的回复。开发者可以按需选择响应方式，即流式或非流式响应，响应方式决定了开发者获取智能体回复的方式。关于获取智能体回复的详细说明可参考​通过对话接口获取智能体回复。​
流式响应：智能体在生成回复的同时，将回复消息以数据流的形式逐条发送给客户端。处理结束后，服务端会返回一条完整的智能体回复。详细说明可参考​流式响应。​
​
2. 请求方式​
POST​
3. 请求地址​
 https://api.coze.cn/v3/chat​​
4. 请求示例：
curl --location --request POST 'https://api.coze.cn/v3/chat?conversation_id=7374752000116113452' \
--header 'Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****' \
--header 'Content-Type: application/json' \
--data-raw '{
    "bot_id": "734829333445931****",
    "user_id": "123456789",
    "stream": true,
    "auto_save_history":true,
    "additional_messages":[
        {
            "role":"user",
            "content":"2024年10月1日是星期几",
            "content_type":"text"
        }
    ]
}'

5. 返回示例：
event:conversation.chat.created
// 在 chat 事件里，data 字段中的 id 为 Chat ID，即会话 ID。
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"created","usage":{"token_count":0,"output_count":0,"input_count":0}}

event:conversation.chat.in_progress
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"in_progress","usage":{"token_count":0,"output_count":0,"input_count":0}}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"2","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"0","content_type":"text","chat_id":"7382159487131697202"}

//省略模型回复的部分中间事件event:conversation.message.delta
......

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"星期三","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"。","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.completed
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"2024 年 10 月 1 日是星期三。","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.completed
data:{"id":"7382159494123552778","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"verbose","content":"{\"msg_type\":\"generate_answer_finish\",\"data\":\"\",\"from_module\":null,\"from_unit\":null}","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.chat.completed
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"completed","usage":{"token_count":633,"output_count":19,"input_count":614}}

event:done
data:"[DONE]"
