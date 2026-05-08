export type ChatRole = 'human' | 'ai';

export type ChatRoleType = 'normal' | 'master' | 'business' | 'qilinge' | 'xiaoman';

export type ChatMessageType = 'reasoning' | 'chat';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  reasoning?: string;
  type: ChatMessageType;
};

// 消息列表
export type ChatMessageList = ChatMessage[]

// 定义左侧消息模式的对象
export type ChatMode = {
    label: string; // 标签
    id: string; // id
    role: ChatRoleType; // 角色
}

// 左侧消息模式列表
export type ChatModeList = ChatMode[]

// 定义发送消息的类型
export type ChatDto = {
    deepThink: boolean; // 是否深度思考
    webSearch: boolean; // 是否开启网络搜索
    role: ChatRoleType; // 角色
    content: string;    // 内容
    userId: string;    // 用户id
}


