export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
    last_seen_at?: string | null;
}

export interface MessageAttachment {
    url: string;
    name: string;
    size: number;
    mime: string;
}

export interface MessageReaction {
    emoji: string;
    count: number;
    user_ids: number[];
}

export interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    sender?: User;
    recipient?: User;
    content: string;
    type: 'text' | 'image' | 'file';
    attachment?: MessageAttachment | null;
    reactions?: MessageReaction[];
    isOptimistic?: boolean;
    isFailed?: boolean;
    delivered_at?: string | null;
    edited_at: string | null;
    read_at?: string | null;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    user: User;
    unread_count: number;
    is_sender: boolean;
    messages: Message[];
    last_message?: Message;
}

export interface MessageSent extends Message {
    sender: User;
    recipient: User;
}

export interface MessageReadEvent {
    message: Pick<Message, 'id' | 'read_at'>;
}

export interface MessageEditedEvent {
    message: Message & {
        sender: Pick<User, 'id' | 'name' | 'email'>;
    };
}

export interface MessageDeletedEvent {
    message: Message & {
        content: 'You deleted this message';
    };
}

export interface MessagesDeliveredEvent {
    message_ids: number[];
    recipient_id: number;
    delivered_at: string;
}

export interface ReactionToggledEvent {
    message_id: number;
    emoji: string;
    action: 'added' | 'removed';
    user_id: number;
    reactions: MessageReaction[];
}
