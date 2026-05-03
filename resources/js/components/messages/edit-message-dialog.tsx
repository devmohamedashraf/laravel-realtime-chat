// components/edit-message-dialog.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useIsEditDialogOpen, useMessageActions, useSelectedMessage } from '@/stores/use-message-store';
import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { z } from 'zod';

const editMessageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters').trim(),
});

type EditMessageFormData = z.infer<typeof editMessageSchema>;

export function EditMessageDialog() {
    const isOpen = useIsEditDialogOpen();
    const selectedMessage = useSelectedMessage();
    const { setIsEditDialogOpen, setSelectedMessage } = useMessageActions();

    const form = useForm({
        defaultValues: {
            content: selectedMessage?.content || '',
        } as EditMessageFormData,
        validators: {
            onChange: editMessageSchema,
            onSubmit: editMessageSchema,
        },
        onSubmit: async ({ value }) => {
            if (!selectedMessage) return;

            if (value.content === selectedMessage.content) {
                setIsEditDialogOpen(false);
                setSelectedMessage(null);
                return;
            }

            try {
                // TODO: Implement actual edit logic here
                console.log('Editing message:', selectedMessage.id, value.content);
                setIsEditDialogOpen(false);
                setSelectedMessage(null);
            } catch (err) {
                console.error('Failed to edit message:', err);
            }
        },
    });

    useEffect(() => {
        if (selectedMessage) {
            form.reset({ content: selectedMessage.content });
        }
    }, [form, selectedMessage]);

    const handleCancel = () => {
        form.reset();
        setIsEditDialogOpen(false);
        setSelectedMessage(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
            setSelectedMessage(null);
            form.reset();
        }
    };

    if (!selectedMessage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-131.25">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void form.handleSubmit();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Edit Message</DialogTitle>
                        <DialogDescription>Make changes to your message. Click save when you're done.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="py-4">
                        <form.Field
                            name="content"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                const hasUnsavedChanges = field.state.value !== selectedMessage.content;

                                return (
                                    <>
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                                            <form.Subscribe
                                                selector={(state) => state.isSubmitting}
                                                children={(isSubmitting) => (
                                                    <Textarea
                                                        id={field.name}
                                                        name={field.name}
                                                        placeholder="Type your message..."
                                                        className="min-h-25 resize-none"
                                                        disabled={isSubmitting}
                                                        aria-invalid={isInvalid}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) => field.handleChange(event.target.value)}
                                                        autoFocus
                                                    />
                                                )}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{field.state.value.length} characters</span>
                                            {hasUnsavedChanges && <span className="text-amber-600">• Unsaved changes</span>}
                                        </div>
                                    </>
                                );
                            }}
                        />
                    </FieldGroup>

                    <form.Subscribe
                        selector={(state) => ({
                            canSubmit: state.canSubmit,
                            isSubmitting: state.isSubmitting,
                        })}
                        children={({ canSubmit, isSubmitting }) => (
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || !canSubmit}>
                                    {isSubmitting && <Spinner className="mr-2" />}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        )}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
