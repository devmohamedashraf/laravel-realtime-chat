import React from 'react';

type EditedIndicatorProps = {
    editedAt: string | Date | null;
};
export const EditedIndicator: React.FC<EditedIndicatorProps> = ({ editedAt }) => {
    if (!editedAt) return null;

    return <span className="pl-1 text-[10px] text-message-bubble-meta-foreground">Edited</span>;
};
