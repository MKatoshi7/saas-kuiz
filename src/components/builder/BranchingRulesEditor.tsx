'use client';

import React from 'react';
import { Plus, Trash2, GitBranch, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/store/builderStore';

interface BranchRule {
  id: string;
  condition: { field: string; op: string; value?: string };
  targetStepId: string;
  label?: string;
}

interface BranchingRulesEditorProps {
  stepId: string;
  branchRules: BranchRule[];
  defaultNextStepId?: string;
  onUpdate: (rules: BranchRule[]) => void;
  onDefaultNextChange: (targetStepId: string | undefined) => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'is_empty', label: 'Está vazio' },
  { value: 'is_not_empty', label: 'Não está vazio' },
];

export function BranchingRulesEditor({
  stepId,
  branchRules = [],
  defaultNextStepId,
  onUpdate,
  onDefaultNextChange,
}: BranchingRulesEditorProps) {
  const steps = useBuilderStore((s) => s.steps);
  const components = useBuilderStore((s) => {
    const data = s.componentsByStep[s.currentStepId || ''];
    return Array.isArray(data) ? data : [];
  });

  const otherSteps = steps.filter(s => s.id !== stepId);

  const getComponentLabel = (componentId: string) => {
    const comp = components.find(c => c.id === componentId);
    if (!comp) return componentId;
    const label = (comp.data as any)?.label || (comp.data as any)?.text || comp.type;
    return `${comp.type}: ${label}`.substring(0, 40);
  };

  const addRule = () => {
    const newRule: BranchRule = {
      id: `rule_${Date.now()}`,
      condition: { field: '', op: 'equals', value: '' },
      targetStepId: otherSteps[0]?.id || '',
      label: '',
    };
    onUpdate([...branchRules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<BranchRule>) => {
    const updated = branchRules.map((r, i) => i === index ? { ...r, ...updates } : r);
    onUpdate(updated);
  };

  const updateRuleCondition = (index: number, conditionUpdates: Partial<BranchRule['condition']>) => {
    const updated = branchRules.map((r, i) =>
      i === index ? { ...r, condition: { ...r.condition, ...conditionUpdates } } : r
    );
    onUpdate(updated);
  };

  const removeRule = (index: number) => {
    onUpdate(branchRules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-blue-500" />
        <Label className="text-xs font-semibold text-gray-700">Regras de Navegação</Label>
      </div>

      <p className="text-[10px] text-gray-500">
        Defina regras para redirecionar o visitante com base nas respostas anteriores.
        Se nenhuma regra bater, o quiz vai para o próximo step padrão.
      </p>

      {branchRules.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-xs">
          Nenhuma regra definida. O quiz segue linearmente.
        </div>
      )}

      {branchRules.map((rule, index) => (
        <div key={rule.id} className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-500">Regra {index + 1}</span>
            <button
              onClick={() => removeRule(index)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500">Campo</Label>
              <select
                value={rule.condition.field}
                onChange={(e) => updateRuleCondition(index, { field: e.target.value })}
                className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white"
              >
                <option value="">Selecionar campo...</option>
                {components.map(c => (
                  <option key={c.id} value={(c.data as any)?.variableName || c.id}>
                    {getComponentLabel(c.id)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-gray-500">Operador</Label>
                <select
                  value={rule.condition.op}
                  onChange={(e) => updateRuleCondition(index, { op: e.target.value })}
                  className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              {!['is_empty', 'is_not_empty'].includes(rule.condition.op) && (
                <div>
                  <Label className="text-[10px] text-gray-500">Valor</Label>
                  <Input
                    value={rule.condition.value || ''}
                    onChange={(e) => updateRuleCondition(index, { value: e.target.value })}
                    placeholder="Valor..."
                    className="h-7 text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-[10px] text-gray-500">Ir para step</Label>
              <div className="flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                <select
                  value={rule.targetStepId}
                  onChange={(e) => updateRule(index, { targetStepId: e.target.value })}
                  className="flex-1 h-7 text-xs border border-gray-200 rounded px-2 bg-white"
                >
                  <option value="">Selecionar step...</option>
                  {otherSteps.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={addRule}
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
      >
        <Plus className="w-3 h-3 mr-1" />
        Adicionar Regra
      </Button>

      <div className="border-t border-gray-200 pt-3">
        <Label className="text-[10px] text-gray-500 mb-1 block">Step Padrão (fallback)</Label>
        <select
          value={defaultNextStepId || ''}
          onChange={(e) => onDefaultNextChange(e.target.value || undefined)}
          className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white"
        >
          <option value="">Próximo step (linear)</option>
          {otherSteps.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400 mt-1">
          Usado quando nenhuma regra bate ou quando o campo está vazio.
        </p>
      </div>
    </div>
  );
}
