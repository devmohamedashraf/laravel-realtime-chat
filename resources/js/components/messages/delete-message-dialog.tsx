import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { messageService } from '@/services/message-service';
import { useIsDeleteDialogOpen, useMessageActions, useSelectedMessage } from '@/stores/use-message-store';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DeleteMessageDialog() {
    const isOpen = useIsDeleteDialogOpen();
    const selectedMessage = useSelectedMessage();
    const { setIsDeleteDialogOpen, setSelectedMessage, updateMessage } = useMessageActions();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedMessage) return;

        setIsDeleting(true);
        try {
            await messageService.deleteMessage(selectedMessage.id);
            updateMessage(selectedMessage.id, {
                content: 'You deleted this message',
                deleted_at: new Date().toISOString(),
            });
            setIsDeleteDialogOpen(false);
            setSelectedMessage(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsDeleteDialogOpen(open);
    };

    const handleCancel = () => {
        setIsDeleteDialogOpen(false);
        setSelectedMessage(null);
    };

    if (!selectedMessage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" />
                        <DialogTitle>Delete Message</DialogTitle>
                    </div>
                    <DialogDescription>Are you sure you want to delete this message? This action cannot be undone.</DialogDescription>
                    <div className="mt-3 rounded-md bg-muted p-3 text-left shadow-xs dark:shadow">
                        <p className="line-clamp-3 text-sm text-muted-foreground">"{selectedMessage.content}"</p>
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" disabled={isDeleting} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
