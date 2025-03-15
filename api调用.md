# 相关配置参数
1. API个人令牌: pat_u67aXHam99YvXgTANjYQZLJiIdugTydmCkwKBYABoAanLNFpUr6Tnro0RL7JHyp8

2. Bot_id:  7478675888952246323

3. space_id: 7474950376467578890


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
会话、对话和消息的概念说明，可参考​基础概念。​
消息在服务端的保存时长为 180 天，到期后自动删除。你也可以调用​删除消息接口，手动从会话中删除消息。​
​
1. 请求方式​
POST​
2. 请求地址​
​
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
​
 https://api.coze.cn/v3/chat​
​


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
