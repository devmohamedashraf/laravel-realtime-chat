// components/MessageReceiptIcon.tsx
import { Message } from '@/types/messages';
import { ClockIcon } from 'lucide-react';
import DoubleCheck from '../icons/double-check';
import SingleCheck from '../icons/single-check';

function MessageReceiptIndicator({ message }: { message: Message }) {
    switch (true) {
        case message?.read_at !== null:
            return <DoubleCheck size={14} className="inline text-blue-400" />;
        case message?.delivered_at !== null:
            return <DoubleCheck size={14} className="inline text-message-bubble-meta-foreground" />;
        case message?.isOptimistic === true:
            return <ClockIcon className="inline size-3.5 text-message-bubble-meta-foreground" />;
        default:
            return <SingleCheck className="inline text-message-bubble-meta-foreground" />;
    }
}

export default MessageReceiptIndicator;
