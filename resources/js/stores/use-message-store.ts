// stores/use-message-store.ts
import { Conversation, Message, MessageReaction, MessageSent, User } from '@/types/messages';
import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

interface MessageState {
    conversations: Conversation[];
    selectedUser: User | null;
    selectedMessage: Message | null;
    isEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isForwardDialogOpen: boolean;
    draftMessage: string;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    actions: {
        setConversations: (conversations: Conversation[]) => void;
        selectConversation: (user: User) => void;
        setSelectedUser: (user: User | null) => void;
        setSelectedMessage: (message: Message | null) => void;
        setIsEditDialogOpen: (isOpen: boolean) => void;
        setIsDeleteDialogOpen: (isOpen: boolean) => void;
        setIsForwardDialogOpen: (isOpen: boolean) => void;
        setDraftMessage: (message: string) => void;
        setIsLoadingConversations: (isLoading: boolean) => void;
        setIsLoadingMessages: (isLoading: boolean) => void;
        addMessage: (message: MessageSent, isSending: boolean) => void;
        replaceMessage: (id: number, newMessage: Message) => void;
        updateMessage: (id: number, updatedMessage: Partial<Message>) => void;
        updateMessageReactions: (messageId: number, reactions: MessageReaction[]) => void;
        setConversationMessages: (userId: number, messages: Message[]) => void;
        prependMessages: (userId: number, messages: Message[]) => void;
        markAsRead: (userId: number) => void;
        clearDraftMessage: () => void;
        resetMessages: () => void;
    };
}

const getLatestMessage = (messages: Message[]): Message | undefined => {
    if (messages.length === 0) {
        return undefined;
    }

    return messages.reduce((latest, current) => (current.id > latest.id ? current : latest));
};

// ⬇️ Not exported - only custom hooks are exported
const useMessageStore = create<MessageState>((set) => ({
    conversations: [],
    selectedUser: null,
    selectedMessage: null,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isForwardDialogOpen: false,
    draftMessage: '',
    isLoadingConversations: true,
    isLoadingMessages: false,
    actions: {
        setConversations: (conversations) =>
            set({
                conversations: [...conversations]
                    .map((conversation) => {
                        const sortedMessages = [...conversation.messages].sort((a, b) => a.id - b.id);
                        const latestMessage = conversation.last_message ?? getLatestMessage(sortedMessages);

                        return {
                            ...conversation,
                            messages: sortedMessages,
                            last_message: latestMessage,
                            is_sender: latestMessage ? latestMessage.sender_id !== conversation.user.id : conversation.is_sender,
                        };
                    })
                    .sort((a, b) => (b.last_message?.id ?? 0) - (a.last_message?.id ?? 0)),
            }),

        selectConversation: (user) =>
            set((state) => ({
                selectedUser: user,
                conversations: state.conversations.map((conversation) =>
                    conversation.user.id === user.id ? { ...conversation, unread_count: 0 } : conversation,
                ),
            })),

        setSelectedUser: (user) => set({ selectedUser: user }),

        setSelectedMessage: (message) => set({ selectedMessage: message }),

        setIsEditDialogOpen: (isOpen) => set({ isEditDialogOpen: isOpen }),

        setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),

        setIsForwardDialogOpen: (isOpen) => set({ isForwardDialogOpen: isOpen }),

        setDraftMessage: (message) => set({ draftMessage: message }),

        setIsLoadingConversations: (isLoading) => set({ isLoadingConversations: isLoading }),

        setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

        addMessage: (msg, isSending = false) =>
            set((state) => {
                const convos = [...state.conversations];

                // Get the conversation partner
                const partner = isSending ? msg.recipient : msg.sender;
                const idx = convos.findIndex((c) => c.user.id === partner.id);
                const isInView = state.selectedUser?.id === partner.id;

                if (idx >= 0) {
                    // Update existing conversation
                    convos[idx] = {
                        ...convos[idx],
                        messages: [...convos[idx].messages, msg],
                        last_message: msg,
                        is_sender: isSending,
                        unread_count: isInView ? 0 : !isSending ? convos[idx].unread_count + 1 : convos[idx].unread_count,
                    };

                    // Move to top
                    convos.unshift(...convos.splice(idx, 1));
                } else {
                    // Create new conversation
                    convos.unshift({
                        user: partner,
                        messages: [msg],
                        last_message: msg,
                        unread_count: isSending ? 0 : 1,
                        is_sender: isSending,
                    });
                }

                // No need to sync selectedConversation since we use selectedUser
                return { conversations: convos };
            }),

        replaceMessage: (id, newMessage) =>
            set((state) => ({
                conversations: state.conversations.map((conv) => ({
                    ...conv,
                    messages: conv.messages.map((msg) => (msg.id === id ? newMessage : msg)),
                    last_message: conv.last_message?.id === id ? newMessage : conv.last_message,
                })),
            })),
        updateMessage: (id, updatedMessage) =>
            set((state) => ({
                conversations: state.conversations.map((conv) => ({
                    ...conv,
                    messages: conv.messages.map((m) => (m.id === id ? { ...m, ...updatedMessage } : m)),
                    last_message: conv.last_message?.id === id ? { ...conv.last_message, ...updatedMessage } : conv.last_message,
                })),
            })),

        updateMessageReactions: (messageId, reactions) =>
            set((state) => ({
                conversations: state.conversations.map((conv) => ({
                    ...conv,
                    messages: conv.messages.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
                })),
            })),

        setConversationMessages: (userId, messages) =>
            set((state) => ({
                conversations: state.conversations.map((conv) => {
                    if (conv.user.id !== userId) {
                        return conv;
                    }

                    const latestMessage = getLatestMessage(messages);

                    return {
                        ...conv,
                        messages,
                        last_message: latestMessage ?? conv.last_message,
                        is_sender: latestMessage ? latestMessage.sender_id !== conv.user.id : conv.is_sender,
                    };
                }),
            })),

        prependMessages: (userId, olderMessages) =>
            set((state) => ({
                conversations: state.conversations.map((conv) =>
                    conv.user.id === userId ? { ...conv, messages: [...olderMessages, ...conv.messages] } : conv,
                ),
            })),

        markAsRead: (userId) =>
            set((state) => ({
                conversations: state.conversations.map((c) => (c.user.id === userId ? { ...c, unread_count: 0 } : c)),
            })),

        clearDraftMessage: () => set({ draftMessage: '' }),

        resetMessages: () =>
            set({
                selectedUser: null,
                selectedMessage: null,
                isEditDialogOpen: false,
                isDeleteDialogOpen: false,
                isForwardDialogOpen: false,
                draftMessage: '',
            }),
    },
}));

// 💡 Atomic selectors - each hook returns a single value
export const useConversations = () => useMessageStore((state) => state.conversations);

export const useSelectedUser = () => useMessageStore((state) => state.selectedUser);

// Create empty array constant to prevent infinite re-renders
const EMPTY_MESSAGES: Message[] = [];

export const useMessages = () => {
    return useMessageStore(
        useShallow((state) => {
            if (!state.selectedUser) return EMPTY_MESSAGES;
            const conversation = state.conversations.find((c) => c.user.id === state.selectedUser?.id);
            return conversation?.messages || EMPTY_MESSAGES;
        }),
    );
};

export const useSelectedMessage = () => useMessageStore((state) => state.selectedMessage);

export const useIsEditDialogOpen = () => useMessageStore((state) => state.isEditDialogOpen);

export const useIsDeleteDialogOpen = () => useMessageStore((state) => state.isDeleteDialogOpen);

export const useIsForwardDialogOpen = () => useMessageStore((state) => state.isForwardDialogOpen);

export const useDraftMessage = () => useMessageStore((state) => state.draftMessage);

export const useIsLoadingConversations = () => useMessageStore((state) => state.isLoadingConversations);

export const useIsLoadingMessages = () => useMessageStore((state) => state.isLoadingMessages);

// 🎉 One selector for all actions
export const useMessageActions = () => useMessageStore((state) => state.actions);
