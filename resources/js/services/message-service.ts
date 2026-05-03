import type { Conversation, Message, MessageReaction } from '@/types/messages';
import axios from 'axios';

export interface PaginatedMessages {
    data: Message[];
    has_more: boolean;
    next_cursor: number | null;
}

export const messageService = {
    async getConversations(): Promise<Conversation[]> {
        const { data } = await axios.get('/api/conversations');
        return data;
    },
    async getMessages(userId: number, before?: number): Promise<PaginatedMessages> {
        const params: Record<string, string | number> = {};
        if (before) {
            params.before = before;
        }
        const { data } = await axios.get(`/api/users/${userId}/messages`, { params });
        return data;
    },
    async sendMessage(recipientId: number, content: string): Promise<Message> {
        const { data } = await axios.post('/api/messages', {
            recipient_id: recipientId,
            content,
            type: 'text',
        });
        return data;
    },
    async sendFile(recipientId: number, file: File, caption?: string): Promise<Message> {
        const formData = new FormData();
        formData.append('recipient_id', String(recipientId));
        formData.append('file', file);
        if (caption) {
            formData.append('content', caption);
        }
        const { data } = await axios.post('/api/messages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
    async markAsRead(messageId: number): Promise<void> {
        await axios.patch(`/api/messages/${messageId}/read`);
    },
    async searchMessages(query: string, userId?: number): Promise<Message[]> {
        const params: Record<string, string | number> = { q: query };
        if (userId) {
            params.user_id = userId;
        }
        const { data } = await axios.get('/api/messages/search', { params });
        return data.data;
    },
    async toggleReaction(messageId: number, emoji: string): Promise<{ action: string; reactions: MessageReaction[] }> {
        const { data } = await axios.post(`/api/messages/${messageId}/reactions`, { emoji });
        return data;
    },
    async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const { data } = await axios.post('/api/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
    async deleteMessage(messageId: number): Promise<void> {
        await axios.delete(`/api/messages/${messageId}`);
    },
    async editMessage(messageId: number, content: string): Promise<Message> {
        const { data } = await axios.patch(`/api/messages/${messageId}`, { content });
        return data;
    },
};
