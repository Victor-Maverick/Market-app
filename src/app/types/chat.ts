// types/chat.ts
export interface MessageDTO {
    fromEmail: string;
    toEmail: string;
    text: string;
}

export interface ChatMessage {
    from: string;
    text: string;
    timestamp: string;
}

export interface ChatNotification {
    from: string;
    message: string;
    timestamp: string;
    chatUrl: string;
}

export interface ChatRequest {
    fromEmail: string;
    toEmail: string;
}



export interface ChatPageProps {
    searchParams: {
        user?: string;
        with?: string;
    };
}