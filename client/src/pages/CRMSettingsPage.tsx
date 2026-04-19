import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import type { CRMConfig, ScoreEvent, ScoreBand, NamedCadence, CadenceStep, CallOutcome } from "@/context/AppContext";
import { DEFAULT_CRM_CONFIG } from "@shared/schema";
import {
  Plus, Trash2, Save, Download, Upload, ChevronRight,
  Zap, Settings2, Phone, Mail, ClipboardList, GripVertical,
  AlertTriangle, Target, Activity
} from "lucide-react";

type Tab = "score" | "cadencias" | "outcomes";

function uid() { return Math.random().toString(36).substr(2, 9); }

export default function CRMSettingsPage() {
  const { crmConfig, setCrmConfig, stages } = useAppContext();
  const [tab, setTab] = useState<Tab>("score");
  const [config, setConfig] = useState<CRMConfig>(() => ({
    ...DEFAULT_CRM_CONFIG,
    ...crmConfig,
    scoreEvents: crmConfig?.scoreEvents?.length ? crmConfig.scoreEvents : DEFAULT_CRM_CONFIG.scoreEvents,
    scoreBands: crmConfig?.scoreBands?.length ? crmConfig.scoreBands : DEFAULT_CRM_CONFIG.scoreBands,
    cadences: crmConfig?.cadences?.length ? crmConfig.cadences : DEFAULT_CRM_CONFIG.cadences,
    callOutcomes: crmConfig?.callOutcomes?.length ? crmConfig.callOutcomes : DEFAULT_CRM_CONFIG.callOutcomes,
  }));
  const [selectedCadenceId, setSelectedCadenceId] = useState<string | null>(config.cadences[0]?.id || null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setCrmConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crm-config.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { setConfig(JSON.parse(ev.target?.result as string)); } catch { alert("Arquivo JSON inválido"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ── Score Events ──────────────────────────────────────────────────────────
  const maxPossibleScore = config.scoreEvents.reduce((sum, e) => e.points > 0 ? sum + e.points : sum, 0);

  const addEvent = () => setConfig(c => ({ ...c, scoreEvents: [...c.scoreEvents, { id: uid(), name: "Novo evento", points: 10 }] }));
  const removeEvent = (id: string) => setConfig(c => ({ ...c, scoreEvents: c.scoreEvents.filter(e => e.id !== id) }));
  const updateEvent = (id: string, field: keyof ScoreEvent, value: any) =>
    setConfig(c => ({ ...c, scoreEvents: c.scoreEvents.map(e => e.id === id ? { ...e, [field]: field === 'points' ? Number(value) : value } : e) }));

  // ── Score Bands ───────────────────────────────────────────────────────────
  const addBand = () => setConfig(c => ({
    ...c, scoreBands: [...c.scoreBands, { id: uid(), name: "Nova Faixa", minScore: 0, maxScore: 19, color: '#64748b', emoji: '⭐' }]
  }));
  const removeBand = (id: string) => setConfig(c => ({ ...c, scoreBands: c.scoreBands.filter(b => b.id !== id) }));
  const updateBand = (id: string, field: keyof ScoreBand, value: any) =>
    setConfig(c => ({
      ...c, scoreBands: c.scoreBands.map(b => b.id === id
        ? { ...b, [field]: (field === 'minScore' || field === 'maxScore') ? Number(value) : value }
        : b)
    }));

  // ── Cadences ──────────────────────────────────────────────────────────────
  const selectedCadence = config.cadences.find(c => c.id === selectedCadenceId) || null;

  const addCadence = () => {
    const id = uid();
    setConfig(c => ({ ...c, cadences: [...c.cadences, { id, name: "Nova Cadência", trigger: 'manual', steps: [] }] }));
    setSelectedCadenceId(id);
  };
  const removeCadence = (id: string) => {
    setConfig(c => ({ ...c, cadences: c.cadences.filter(c2 => c2.id !== id) }));
    setSelectedCadenceId(prev => prev === id ? config.cadences.find(c => c.id !== id)?.id || null : prev);
  };
  const updateCadence = (id: string, field: keyof NamedCadence, value: any) =>
    setConfig(c => ({ ...c, cadences: c.cadences.map(cad => cad.id === id ? { ...cad, [field]: value } : cad) }));

  const addStep = (cadenceId: string) => {
    const step: CadenceStep = { id: uid(), day: 1, channel: 'openphone', condition: 'always', messageTemplate: '' };
    setConfig(c => ({
      ...c, cadences: c.cadences.map(cad => cad.id === cadenceId ? { ...cad, steps: [...cad.steps, step] } : cad)
    }));
  };
  const removeStep = (cadenceId: string, stepId: string) =>
    setConfig(c => ({
      ...c, cadences: c.cadences.map(cad => cad.id === cadenceId ? { ...cad, steps: cad.steps.filter(s => s.id !== stepId) } : cad)
    }));
  const updateStep = (cadenceId: string, stepId: string, field: keyof CadenceStep, value: any) =>
    setConfig(c => ({
      ...c, cadences: c.cadences.map(cad => cad.id === cadenceId
        ? { ...cad, steps: cad.steps.map(s => s.id === stepId ? { ...s, [field]: field === 'day' ? Number(value) : value } : s) }
        : cad)
    }));

  // ── Call Outcomes ─────────────────────────────────────────────────────────
  const addOutcome = () => setConfig(c => ({ ...c, callOutcomes: [...c.callOutcomes, { id: uid(), name: "Novo Resultado", points: 0 }] }));
  const removeOutcome = (id: string) => setConfig(c => ({ ...c, callOutcomes: c.callOutcomes.filter(o => o.id !== id) }));
  const updateOutcome = (id: string, field: keyof CallOutcome, value: any) =>
    setConfig(c => ({
      ...c, callOutcomes: c.callOutcomes.map(o => o.id === id
        ? { ...o, [field]: field === 'points' ? Number(value) : value }
        : o)
    }));

  const TRIGGER_LABELS: Record<string, string> = {
    manual: 'Manual', on_schedule: 'Ao agendar call', on_noshow: 'No-show', on_postsale: 'Pós-venda', on_cancel: 'Ao cancelar'
  };
  const CHANNEL_LABELS: Record<string, string> = { openphone: 'OpenPhone / WhatsApp', email: 'Email', manual: 'Tarefa Manual' };
  const CONDITION_LABELS: Record<string, string> = { always: 'Sempre', if_no_reply: 'Se não respondeu o passo anterior', if_replied: 'Se respondeu o passo anterior' };
  const CHANNEL_ICONS: Record<string, any> = { openphone: Phone, email: Mail, manual: ClipboardList };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações do CRM</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure scoring, cadências e resultados de call do seu CRM.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-1.5 h-8 text-xs" onClick={importConfig}>
            <Upload className="w-3.5 h-3.5" /> Importar JSON
          </Button>
          <Button variant="outline" className="gap-1.5 h-8 text-xs" onClick={exportConfig}>
            <Download className="w-3.5 h-3.5" /> Exportar JSON
          </Button>
          <Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground" onClick={save}>
            <Save className="w-3.5 h-3.5" /> {saved ? "Salvo!" : "Salvar Configurações"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/30 rounded-lg p-1 mb-6 shrink-0 w-fit">
        {([
          { id: 'score', label: 'Score & Bandas', icon: Target },
          { id: 'cadencias', label: 'Cadências', icon: Activity },
          { id: 'outcomes', label: 'Resultados da Call', icon: Phone },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Tab: Score Settings ──────────────────────────────────────────── */}
        {tab === 'score' && (
          <div className="space-y-8 max-w-3xl pb-20">

            {/* Score Events */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Eventos de Score</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Score máximo possível: <strong>{maxPossibleScore} pts</strong></p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addEvent}>
                  <Plus className="w-3.5 h-3.5" /> Adicionar Evento
                </Button>
              </div>
              <div className="space-y-2">
                {config.scoreEvents.map((event, i) => (
                  <div key={event.id} className="flex items-center gap-3 bg-card border rounded-lg px-3 py-2.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab shrink-0" />
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <Input
                      value={event.name}
                      onChange={e => updateEvent(event.id, 'name', e.target.value)}
                      className="flex-1 h-8 text-sm bg-transparent border-0 focus-visible:ring-0 px-0"
                      placeholder="Nome do evento"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">pts:</span>
                      <Input
                        type="number"
                        value={event.points}
                        onChange={e => updateEvent(event.id, 'points', e.target.value)}
                        className={`w-20 h-8 text-sm text-center font-bold ${event.points > 0 ? 'text-emerald-500' : 'text-destructive'}`}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeEvent(event.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Score Bands */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">Faixas de Classificação</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Defina labels, cores e ícones para cada faixa de score.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addBand}>
                  <Plus className="w-3.5 h-3.5" /> Nova Faixa
                </Button>
              </div>
              <div className="space-y-2">
                {config.scoreBands.sort((a, b) => b.minScore - a.minScore).map(band => (
                  <div key={band.id} className="flex items-center gap-3 bg-card border rounded-lg px-3 py-2.5 flex-wrap sm:flex-nowrap">
                    {/* Color picker */}
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={band.color}
                        onChange={e => updateBand(band.id, 'color', e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-md border-2 border-border" style={{ backgroundColor: band.color }} />
                    </div>
                    {/* Emoji */}
                    <Input
                      value={band.emoji}
                      onChange={e => updateBand(band.id, 'emoji', e.target.value)}
                      className="w-14 h-8 text-center text-lg bg-transparent border-0 focus-visible:ring-0 px-0"
                      placeholder="⭐"
                      maxLength={4}
                    />
                    {/* Name */}
                    <Input
                      value={band.name}
                      onChange={e => updateBand(band.id, 'name', e.target.value)}
                      className="flex-1 min-w-[120px] h-8 text-sm font-medium bg-transparent border-0 focus-visible:ring-0 px-0"
                      placeholder="Nome da faixa"
                    />
                    {/* Score range */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input
                        type="number"
                        value={band.minScore}
                        onChange={e => updateBand(band.id, 'minScore', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        min="0"
                      />
                      <span className="text-muted-foreground text-xs">–</span>
                      <Input
                        type="number"
                        value={band.maxScore}
                        onChange={e => updateBand(band.id, 'maxScore', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        min="0"
                      />
                    </div>
                    {/* Preview */}
                    <div
                      className="px-2 py-0.5 rounded text-xs font-bold shrink-0"
                      style={{ backgroundColor: band.color + '20', color: band.color }}
                    >
                      {band.emoji} {band.name}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeBand(band.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Display & Alerts */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <h2 className="text-sm font-semibold">Formato de Exibição do Score</h2>
                <div className="space-y-2">
                  {[{ value: 'fraction', label: '74/100 (Fração)' }, { value: 'percent', label: '74% (Porcentagem)' }].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="displayFormat"
                        value={opt.value}
                        checked={config.displayFormat === opt.value}
                        onChange={() => setConfig(c => ({ ...c, displayFormat: opt.value as 'fraction' | 'percent' }))}
                        className="accent-primary"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerta de Score Baixo
                </h2>
                <p className="text-xs text-muted-foreground">Notificar quando o score cair abaixo de:</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.alertThreshold}
                    onChange={e => setConfig(c => ({ ...c, alertThreshold: Number(e.target.value) }))}
                    className="w-24 h-9"
                    min="0"
                  />
                  <span className="text-sm text-muted-foreground">pontos</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── Tab: Cadências ───────────────────────────────────────────────── */}
        {tab === 'cadencias' && (
          <div className="flex gap-4 h-[calc(100vh-18rem)] pb-4">
            {/* Left: Cadence list */}
            <div className="w-56 shrink-0 flex flex-col gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 w-full text-xs" onClick={addCadence}>
                <Plus className="w-3.5 h-3.5" /> Nova Cadência
              </Button>
              <div className="space-y-1 overflow-y-auto flex-1">
                {config.cadences.map(cad => (
                  <button
                    key={cad.id}
                    onClick={() => setSelectedCadenceId(cad.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between gap-2
                      ${selectedCadenceId === cad.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
                  >
                    <span className="truncate">{cad.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{cad.steps.length}</span>
                      <ChevronRight className="w-3 h-3 opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Cadence detail */}
            {selectedCadence ? (
              <div className="flex-1 bg-card border rounded-xl p-5 overflow-y-auto space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Nome da Cadência</label>
                      <Input
                        value={selectedCadence.name}
                        onChange={e => updateCadence(selectedCadence.id, 'name', e.target.value)}
                        className="mt-1 h-9 text-base font-semibold"
                        placeholder="Ex: Pós-Agendamento"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Quando Disparar</label>
                      <select
                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        value={selectedCadence.trigger}
                        onChange={e => updateCadence(selectedCadence.id, 'trigger', e.target.value)}
                      >
                        {Object.entries(TRIGGER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs gap-1" onClick={() => removeCadence(selectedCadence.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Passos da Cadência</h3>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addStep(selectedCadence.id)}>
                      <Plus className="w-3.5 h-3.5" /> Adicionar Passo
                    </Button>
                  </div>

                  {selectedCadence.steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      <p>Nenhum passo configurado.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => addStep(selectedCadence.id)}>Adicionar Primeiro Passo</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCadence.steps.map((step, i) => {
                        const ChannelIcon = CHANNEL_ICONS[step.channel] || Phone;
                        return (
                          <div key={step.id} className="border rounded-xl p-4 bg-secondary/10 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex flex-col items-center justify-center bg-background w-10 h-10 rounded-lg border shrink-0">
                                <span className="text-[9px] text-muted-foreground font-bold uppercase">Dia</span>
                                <Input
                                  type="number"
                                  value={step.day}
                                  onChange={e => updateStep(selectedCadence.id, step.id, 'day', e.target.value)}
                                  className="h-5 w-full text-center text-sm font-bold border-0 p-0 focus-visible:ring-0 bg-transparent"
                                  min="1"
                                />
                              </div>

                              <div className="flex-1 min-w-[150px]">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Canal</label>
                                <select
                                  className="mt-1 flex h-8 w-full rounded-md border border-input bg-background text-foreground px-2 text-sm focus:outline-none"
                                  value={step.channel}
                                  onChange={e => updateStep(selectedCadence.id, step.id, 'channel', e.target.value)}
                                >
                                  {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                              </div>

                              <div className="flex-1 min-w-[150px]">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Condição</label>
                                <select
                                  className="mt-1 flex h-8 w-full rounded-md border border-input bg-background text-foreground px-2 text-sm focus:outline-none"
                                  value={step.condition}
                                  onChange={e => updateStep(selectedCadence.id, step.id, 'condition', e.target.value)}
                                >
                                  {Object.entries(CONDITION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                              </div>

                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-4" onClick={() => removeStep(selectedCadence.id, step.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                Mensagem/Tarefa
                                <span className="ml-2 normal-case font-normal opacity-60">vars: {'{first_name}'} {'{company}'} {'{call_date}'} {'{call_time}'} {'{reschedule_link}'}</span>
                              </label>
                              <textarea
                                value={step.messageTemplate}
                                onChange={e => updateStep(selectedCadence.id, step.id, 'messageTemplate', e.target.value)}
                                className="mt-1 w-full min-h-[80px] p-2.5 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Template da mensagem..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Selecione ou crie uma cadência</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Call Outcomes ───────────────────────────────────────────── */}
        {tab === 'outcomes' && (
          <div className="space-y-4 max-w-2xl pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Resultados da Call</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure os possíveis resultados de uma call e suas consequências.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addOutcome}>
                <Plus className="w-3.5 h-3.5" /> Novo Resultado
              </Button>
            </div>

            <div className="space-y-3">
              {config.callOutcomes.map(outcome => (
                <div key={outcome.id} className="bg-card border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      value={outcome.name}
                      onChange={e => updateOutcome(outcome.id, 'name', e.target.value)}
                      className="flex-1 h-9 font-medium"
                      placeholder="Ex: Apareceu - Interessado"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-muted-foreground">pts:</span>
                      <Input
                        type="number"
                        value={outcome.points}
                        onChange={e => updateOutcome(outcome.id, 'points', e.target.value)}
                        className={`w-20 h-9 text-center font-bold ${outcome.points > 0 ? 'text-emerald-500' : outcome.points < 0 ? 'text-destructive' : ''}`}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeOutcome(outcome.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Disparar Cadência</label>
                      <select
                        className="mt-1 flex h-8 w-full rounded-md border border-input bg-background text-foreground px-2 text-sm focus:outline-none"
                        value={outcome.cadenceId || ''}
                        onChange={e => updateOutcome(outcome.id, 'cadenceId', e.target.value)}
                      >
                        <option value="">Nenhuma cadência</option>
                        {config.cadences.map(cad => <option key={cad.id} value={cad.id}>{cad.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mover para Etapa</label>
                      <select
                        className="mt-1 flex h-8 w-full rounded-md border border-input bg-background text-foreground px-2 text-sm focus:outline-none"
                        value={outcome.targetStageId || ''}
                        onChange={e => updateOutcome(outcome.id, 'targetStageId', e.target.value)}
                      >
                        <option value="">Não mover</option>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
