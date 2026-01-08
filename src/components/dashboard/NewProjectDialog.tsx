'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NewProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Por favor, insira um nome para o projeto');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);

            const res = await fetch('/api/funnels', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Erro ao criar projeto');
            }

            const data = await res.json();

            toast.success('Projeto criado com sucesso!');
            onOpenChange(false);
            setTitle('');
            setDescription('');

            // Redirect to builder
            router.push(`/dashboard/${data.id}/builder`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar projeto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Projeto</DialogTitle>
                    <DialogDescription>
                        Crie um novo funil ou quiz para começar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Nome do Projeto</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Quiz de Emagrecimento"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descrição do objetivo..."
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Projeto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
