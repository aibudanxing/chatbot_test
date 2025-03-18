// 配置参数
const API_TOKEN = 'pat_u67aXHam99YvXgTANjYQZLJiIdugTydmCkwKBYABoAanLNFpUr6Tnro0RL7JHyp8';
const BOT_ID = '7478675888952246323';

// DOM 元素
let chatMessages;
let messageInput;
let sendButton;
let typingIndicator;

// 会话ID
let conversationId = null;

// 初始化DOM元素引用
function initDOMElements() {
    chatMessages = document.getElementById('chatMessages');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    typingIndicator = document.getElementById('typingIndicator');
}

// 初始化会话
async function initConversation() {
    try {
        console.log('开始初始化会话...');
        const response = await fetch('https://api.coze.cn/v1/conversation/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
                // 移除可能导致CORS问题的头部
            },
            body: JSON.stringify({
                meta_data: {
                    uuid: generateUUID()
                }
            })
        });
        
        console.log('会话初始化响应状态:', response.status, response.statusText);
        
        // 检查响应状态
        if (!response.ok) {
            const errorText = await response.text();
            console.error('初始化会话HTTP错误:', response.status, errorText);
            addStatusMessage(`初始化会话失败 (${response.status})，请刷新页面重试`);
            return false;
        }
        
        const data = await response.json();
        console.log('会话初始化响应数据:', data);
        
        if (data.code === 0 && data.data && data.data.id) {
            conversationId = data.data.id;
            console.log('会话已创建，ID:', conversationId);
            return true;
        } else {
            console.error('创建会话失败:', data);
            addStatusMessage(`创建会话失败: ${data.msg || '未知错误'}，请刷新页面重试`);
            return false;
        }
    } catch (error) {
        console.error('创建会话出错:', error);
        addStatusMessage('网络错误，请检查网络连接后重试');
        return false;
    }
}

// 发送消息并获取回复
async function sendMessage(message) {
    if (!conversationId) {
        const initialized = await initConversation();
        if (!initialized) return;
    }
    
    // 显示用户消息
    addUserMessage(message);
    messageInput.value = '';
    
    // 显示机器人正在输入的提示
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // 创建用户消息
        console.log('开始创建用户消息...');
        const messageResponse = await fetch('https://api.coze.cn/v1/conversation/message/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                role: 'user',
                content: message,
                content_type: 'text'
            })
        });
        
        console.log('创建消息响应状态:', messageResponse.status, messageResponse.statusText);
        
        if (!messageResponse.ok) {
            const errorText = await messageResponse.text();
            console.error('创建消息失败:', errorText);
            throw new Error(`创建消息失败: ${messageResponse.status}, ${errorText}`);
        }
        
        const messageData = await messageResponse.json();
        console.log('创建消息响应数据:', messageData);
        
        // 发起对话获取回复（流式响应）
        console.log('开始发起对话...');
        let retryCount = 0;
        const maxRetries = 2;
        let chatResponse;
        
        while (retryCount <= maxRetries) {
            try {
                chatResponse = await fetch(`https://api.coze.cn/v3/chat?conversation_id=${conversationId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        bot_id: BOT_ID,
                        user_id: generateUUID(),
                        stream: true,
                        auto_save_history: true,
                        additional_messages: [
                            {
                                role: 'user',
                                content: message,
                                content_type: 'text'
                            }
                        ]
                    })
                });
                
                console.log('对话请求状态:', chatResponse.status, chatResponse.statusText);
                
                if (chatResponse.ok) {
                    break; // 成功获取响应，跳出重试循环
                } else {
                    const errorText = await chatResponse.text();
                    console.error(`API响应错误 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, errorText);
                    
                    if (retryCount < maxRetries) {
                        // 如果还有重试次数，等待后重试
                        const waitTime = 1000 * (retryCount + 1); // 递增等待时间
                        console.log(`等待 ${waitTime}ms 后重试...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        retryCount++;
                    } else {
                        throw new Error(`HTTP error! status: ${chatResponse.status}, message: ${errorText}`);
                    }
                }
            } catch (fetchError) {
                console.error(`请求出错 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, fetchError);
                
                if (retryCount < maxRetries) {
                    // 如果还有重试次数，等待后重试
                    const waitTime = 1000 * (retryCount + 1); // 递增等待时间
                    console.log(`等待 ${waitTime}ms 后重试...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retryCount++;
                } else {
                    throw fetchError; // 重试次数用完，抛出错误
                }
            }
        }
        
        if (!chatResponse || !chatResponse.ok) {
            throw new Error('无法获取有效响应');
        }
        const reader = chatResponse.body.getReader();
        const decoder = new TextDecoder();
        let botMessageElement = null;
        let botMessageContent = '';
        let receivedData = false;
        let buffer = ''; // 添加缓冲区存储不完整的数据块
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            console.log('收到数据块:', chunk);
            receivedData = true;
            
            // 将新数据添加到缓冲区
            buffer += chunk;
            
            // 处理完整的行
            let lineEnd;
            while ((lineEnd = buffer.indexOf('\n')) >= 0) {
                const line = buffer.substring(0, lineEnd).trim();
                buffer = buffer.substring(lineEnd + 1);
                
                if (!line) continue;
                
                try {
                    // 解析事件和数据
                    console.log('处理行:', line);
                    
                    const eventMatch = line.match(/^event:(.+)$/);
                    const dataMatch = line.match(/^data:(.+)$/);
                    
                    if (eventMatch) {
                        const event = eventMatch[1].trim();
                        console.log('检测到事件:', event);
                        
                        // 跳过完成事件
                        if (event === 'done' || event === 'conversation.message.completed') {
                            console.log('跳过完成事件:', event);
                            continue;
                        }
                    }
                    
                    if (dataMatch) {
                        try {
                            // 处理特殊情况：[DONE]标记
                            if (dataMatch[1].trim() === '"[DONE]"') {
                                console.log('收到完成标记');
                                continue;
                            }
                            
                            const data = JSON.parse(dataMatch[1]);
                            console.log('解析的数据:', data);
                            
                            // 处理增量更新消息，包括delta和answer类型
                            if ((data.role === 'assistant') && data.content) {
                                // 过滤掉包含{msg_type及其后面内容的数据
                                let filteredContent = data.content;
                                const msgTypeIndex = filteredContent.indexOf('{"msg_type');
                                if (msgTypeIndex !== -1) {
                                    filteredContent = filteredContent.substring(0, msgTypeIndex);
                                }
                                
                                // 检查是否有重复内容，避免重复显示
                                if (filteredContent.trim() && !botMessageContent.includes(filteredContent)) {
                                    // 第一次收到消息时创建消息元素
                                    if (!botMessageElement) {
                                        typingIndicator.style.display = 'none';
                                        botMessageElement = document.createElement('div');
                                        botMessageElement.className = 'message bot-message';
                                        
                                        const contentElement = document.createElement('div');
                                        contentElement.className = 'message-content';
                                        botMessageElement.appendChild(contentElement);
                                        
                                        chatMessages.insertBefore(botMessageElement, typingIndicator);
                                    }
                                    
                                    // 追加内容
                                    botMessageContent += filteredContent;
                                    // 使用showdown.js渲染Markdown
                                    const converter = new showdown.Converter();
                                    botMessageElement.querySelector('.message-content').innerHTML = converter.makeHtml(botMessageContent);
                                    chatMessages.scrollTop = chatMessages.scrollHeight;
                                }
                            }
                        } catch (jsonError) {
                            console.error('JSON解析失败:', dataMatch[1], jsonError);
                        }
                    }
                } catch (e) {
                    console.error('解析响应出错:', e, line);
                }
            }
        }
        
        // 处理可能剩余的不完整行
        if (buffer.trim()) {
            console.log('处理剩余数据:', buffer);
            try {
                const eventMatch = buffer.match(/^event:(.+)$/);
                const dataMatch = buffer.match(/^data:(.+)$/);
                
                // 忽略conversation.message.completed事件
                if (eventMatch && eventMatch[1].trim() === 'conversation.message.completed') {
                    console.log('忽略剩余的完整消息事件');
                }
                else if (dataMatch) {
                    try {
                        const data = JSON.parse(dataMatch[1]);
                        
                        // 检查是否是完整消息事件的数据，如果是则跳过
                        if (buffer.includes('conversation.message.completed') || data.type === 'verbose') {
                            console.log('跳过剩余数据中的完整消息');
                            return; // 将continue改为return，因为这里不在循环内
                        }
                        
                        // 检查是否是完整消息类型的数据，如果是则跳过
                        if (data.type === 'answer' && buffer.includes('conversation.message.completed')) {
                            console.log('跳过剩余数据中的完整消息类型数据');
                            return;
                        }
                        
                        // 过滤掉包含{msg_type及其后面内容的数据
                        let filteredContent = data.content;
                        const msgTypeIndex = filteredContent.indexOf('{"msg_type');
                        if (msgTypeIndex !== -1) {
                            filteredContent = filteredContent.substring(0, msgTypeIndex);
                        }
                        
                        // 只有在有有效内容且不是重复内容时才处理
                        if (filteredContent.trim() && !botMessageContent.includes(filteredContent)) {
                            if (!botMessageElement) {
                                typingIndicator.style.display = 'none';
                                botMessageElement = document.createElement('div');
                                botMessageElement.className = 'message bot-message';
                                
                                const contentElement = document.createElement('div');
                                contentElement.className = 'message-content';
                                botMessageElement.appendChild(contentElement);
                                
                                chatMessages.insertBefore(botMessageElement, typingIndicator);
                            }
                            
                            botMessageContent += filteredContent;
                            // 使用showdown.js渲染Markdown
                            const converter = new showdown.Converter();
                            botMessageElement.querySelector('.message-content').innerHTML = converter.makeHtml(botMessageContent);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (jsonError) {
                        console.error('JSON解析剩余数据失败:', dataMatch[1], jsonError);
                    }
                }
            } catch (e) {
                console.error('解析剩余响应出错:', e, buffer);
            }
        }
        
        // 如果没有收到任何数据，显示错误消息
        if (!receivedData || !botMessageElement) {
            addStatusMessage('未收到有效回复，请重试');
        }
        
        // 隐藏输入提示
        typingIndicator.style.display = 'none';
        
    } catch (error) {
        console.error('发送消息出错:', error);
        typingIndicator.style.display = 'none';
        addStatusMessage('发送消息失败，请重试');
    }
}

// 添加用户消息到聊天窗口
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = message;
    
    messageElement.appendChild(contentElement);
    chatMessages.insertBefore(messageElement, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加状态消息
function addStatusMessage(message) {
    const statusElement = document.createElement('div');
    statusElement.className = 'status-message';
    statusElement.textContent = message;
    
    chatMessages.insertBefore(statusElement, typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 生成UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 事件监听设置
function setupEventListeners() {
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = messageInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });
}

// 初始化应用
function initApp() {
    initDOMElements();
    setupEventListeners();
    initConversation();
}

// 页面加载时初始化应用
window.addEventListener('load', initApp);
