'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Loader2, Trash2, Power, PowerOff, ChevronLeft, ChevronRight, Copy, Tag, Percent, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Coupon {
    id: string
    code: string
    description: string | null
    discountType: 'percent' | 'fixed'
    discountValue: number
    maxUses: number | null
    usedCount: number
    validFrom: string
    validUntil: string | null
    applicablePlans: string | null
    isActive: boolean
    createdAt: string
}

const PLAN_OPTIONS = [
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
]

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [createOpen, setCreateOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({
        code: '',
        description: '',
        discountType: 'percent' as 'percent' | 'fixed',
        discountValue: 10,
        maxUses: '',
        validUntil: '',
        applicablePlans: [] as string[],
    })

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/coupons?search=${search}&page=${page}`)
            const data = await res.json()
            setCoupons(data.coupons || [])
            setTotalPages(data.pages || 1)
        } catch {
            toast.error('Erro ao carregar cupons')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const t = setTimeout(fetchCoupons, 300)
        return () => clearTimeout(t)
    }, [search, page])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: form.code,
                    description: form.description || null,
                    discountType: form.discountType,
                    discountValue: form.discountValue,
                    maxUses: form.maxUses ? Number(form.maxUses) : null,
                    validUntil: form.validUntil || null,
                    applicablePlans: form.applicablePlans,
                }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro')
            }
            toast.success('Cupom criado!')
            setCreateOpen(false)
            setForm({ code: '', description: '', discountType: 'percent', discountValue: 10, maxUses: '', validUntil: '', applicablePlans: [] })
            fetchCoupons()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Erro ao criar')
        } finally {
            setCreating(false)
        }
    }

    const handleToggle = async (c: Coupon) => {
        try {
            const res = await fetch(`/api/admin/coupons/${c.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !c.isActive }),
            })
            if (!res.ok) throw new Error()
            toast.success(c.isActive ? 'Cupom desativado' : 'Cupom ativado')
            fetchCoupons()
        } catch {
            toast.error('Erro')
        }
    }

    const handleDelete = async (c: Coupon) => {
        if (!confirm(`Deletar cupom ${c.code}?`)) return
        try {
            const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            toast.success('Cupom deletado')
            fetchCoupons()
        } catch {
            toast.error('Erro ao deletar')
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success('Código copiado!')
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cupons de Desconto</h1>
                    <p className="text-muted-foreground mt-1">Crie cupons para campanhas promocionais.</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                    Novo Cupom
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por código ou descrição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Código</TableHead>
                            <TableHead>Desconto</TableHead>
                            <TableHead>Uso</TableHead>
                            <TableHead>Planos</TableHead>
                            <TableHead>Validade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Nenhum cupom criado
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((c) => {
                                const expired = c.validUntil && new Date(c.validUntil) < new Date()
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <button
                                                onClick={() => copyCode(c.code)}
                                                className="flex items-center gap-1.5 font-mono font-semibold text-foreground hover:text-blue-600 transition-colors"
                                            >
                                                {c.code}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            {c.description && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs truncate">
                                                    {c.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {c.discountType === 'percent' ? (
                                                <Badge variant="primary">
                                                    <Percent className="w-3 h-3" />
                                                    {c.discountValue}%
                                                </Badge>
                                            ) : (
                                                <Badge variant="success">
                                                    <DollarSign className="w-3 h-3" />
                                                    R$ {c.discountValue}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{c.usedCount}</span>
                                            <span className="text-muted-foreground text-sm">
                                                {c.maxUses ? ` / ${c.maxUses}` : ' / ∞'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {c.applicablePlans
                                                    ? c.applicablePlans.split(',').map((p) => (
                                                        <Badge key={p} variant="outline" size="sm">{p}</Badge>
                                                    ))
                                                    : <span className="text-xs text-muted-foreground">Todos</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {c.validUntil ? (
                                                <div className="text-sm">
                                                    <p>{format(new Date(c.validUntil), 'dd/MM/yyyy')}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {expired ? 'expirado' : `expira em ${formatDistanceToNow(new Date(c.validUntil), { locale: ptBR })}`}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Sem prazo</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {expired ? (
                                                <Badge variant="secondary" size="sm">Expirado</Badge>
                                            ) : c.isActive ? (
                                                <Badge variant="success" size="sm" dot>Ativo</Badge>
                                            ) : (
                                                <Badge variant="secondary" size="sm" dot>Inativo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleToggle(c)}
                                                    title={c.isActive ? 'Desativar' : 'Ativar'}
                                                >
                                                    {c.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDelete(c)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Deletar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
                <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between bg-secondary/20">
                    <span className="text-xs text-muted-foreground">
                        Página <span className="font-semibold">{page}</span> de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Anterior
                        </Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                            Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </Card>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Novo Cupom</DialogTitle>
                        <DialogDescription>
                            Crie um cupom para campanhas promocionais. O código será convertido para maiúsculas.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Código *</Label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="PROMO2026"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Black Friday 50% off"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <select
                                    value={form.discountType}
                                    onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })}
                                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
                                >
                                    <option value="percent">% Porcentagem</option>
                                    <option value="fixed">R$ Valor fixo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>{form.discountType === 'percent' ? 'Percentual *' : 'Valor (R$) *'}</Label>
                                <Input
                                    type="number"
                                    min={form.discountType === 'percent' ? 1 : 0.01}
                                    max={form.discountType === 'percent' ? 100 : 99999}
                                    step="0.01"
                                    value={form.discountValue}
                                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Limite de usos</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={form.maxUses}
                                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                    placeholder="Ilimitado"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expira em</Label>
                                <Input
                                    type="date"
                                    value={form.validUntil}
                                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Aplicável a</Label>
                            <div className="flex flex-wrap gap-2">
                                {PLAN_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            const exists = form.applicablePlans.includes(opt.value)
                                            setForm({
                                                ...form,
                                                applicablePlans: exists
                                                    ? form.applicablePlans.filter((p) => p !== opt.value)
                                                    : [...form.applicablePlans, opt.value],
                                            })
                                        }}
                                        className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${
                                            form.applicablePlans.includes(opt.value)
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'border-border text-muted-foreground hover:border-foreground/30'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                {form.applicablePlans.length === 0 && (
                                    <span className="text-xs text-muted-foreground self-center">vazio = todos os planos</span>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                            <Button type="submit" loading={creating}>Criar cupom</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
