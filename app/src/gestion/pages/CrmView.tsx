import { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Mail,
  Building2,
  Calendar,
  Plus,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  FileText,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  X,
  PhoneCall,
} from 'lucide-react';
import { api, type Lead } from '../../lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nuevo: { label: 'Nuevo', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  contactado: { label: 'Contactado', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  en_negociacion: { label: 'En Negociación', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  cotizado: { label: 'Cotizado', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  ganado: { label: 'Ganado / Obra', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  perdido: { label: 'Perdido', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30' },
};

const INTERACTION_TYPES: Record<string, { label: string; icon: any }> = {
  llamada: { label: 'Llamada', icon: PhoneCall },
  reunion: { label: 'Reunión', icon: Users },
  correo: { label: 'Correo', icon: Mail },
  visita_obra: { label: 'Visita a Obra', icon: Building2 },
  cotizacion: { label: 'Cotización Enviada', icon: FileText },
  nota: { label: 'Nota Interna', icon: MessageSquare },
  contacto_web: { label: 'Mensaje Web', icon: ExternalLink },
  cambio_estado: { label: 'Cambio de Estado', icon: TrendingUp },
  proyecto_creado: { label: 'Proyecto Creado', icon: CheckCircle2 },
};

export default function CrmView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Interaction form state
  const [interactionType, setInteractionType] = useState('llamada');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [submittingInteraction, setSubmittingInteraction] = useState(false);

  // New lead manual modal state
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.leads.getAll();
      setLeads(data);
    } catch (err) {
      console.error('Error cargando leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openLeadDetails = async (lead: Lead) => {
    try {
      const detailed = await api.leads.getById(lead.id);
      setSelectedLead(detailed);
    } catch (err) {
      console.error('Error cargando detalle del lead:', err);
      setSelectedLead(lead);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      const updated = await api.leads.update(selectedLead.id, { status: newStatus as any });
      setSelectedLead(prev => prev ? { ...prev, status: updated.status } : null);
      loadLeads();
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !interactionNotes.trim()) return;

    try {
      setSubmittingInteraction(true);
      await api.leads.addInteraction(selectedLead.id, {
        type: interactionType,
        notes: interactionNotes,
      });
      setInteractionNotes('');
      // Reload lead details with new interaction
      const refreshed = await api.leads.getById(selectedLead.id);
      setSelectedLead(refreshed);
      loadLeads();
    } catch (err) {
      alert('Error al guardar la actividad');
    } finally {
      setSubmittingInteraction(false);
    }
  };

  const handleConvertToProject = async () => {
    if (!selectedLead) return;
    const confirmConversion = window.confirm(
      `¿Deseas convertir el prospecto "${selectedLead.company || selectedLead.name}" en un nuevo Proyecto de obra?`
    );
    if (!confirmConversion) return;

    try {
      const res = await api.leads.convertToProject(selectedLead.id, {
        project_name: `Obra: ${selectedLead.company || selectedLead.name}`,
        location: 'Venezuela',
      });
      alert(res.message);
      const refreshed = await api.leads.getById(selectedLead.id);
      setSelectedLead(refreshed);
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Error al convertir en proyecto');
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.leads.createPublicLead(newLeadForm);
      setShowNewLeadModal(false);
      setNewLeadForm({ name: '', email: '', phone: '', company: '', message: '' });
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Error al crear el contacto');
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalLeads = leads.length;
  const nuevosCount = leads.filter((l) => l.status === 'nuevo').length;
  const enNegociacionCount = leads.filter((l) => ['contactado', 'en_negociacion', 'cotizado'].includes(l.status)).length;
  const ganadosCount = leads.filter((l) => l.status === 'ganado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Gestión de Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Control de prospectos, solicitudes de la web y seguimiento histórico de negociaciones.
          </p>
        </div>
        <button
          onClick={() => setShowNewLeadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Contacto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-50/60 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Prospectos</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalLeads}</p>
        </div>

        <div className="bg-dark-50/60 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Nuevos por Atender</span>
            <AlertCircle className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">{nuevosCount}</p>
        </div>

        <div className="bg-dark-50/60 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs font-medium uppercase tracking-wider">En Negociación / Cotizados</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{enNegociacionCount}</p>
        </div>

        <div className="bg-dark-50/60 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Obras Ganadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{ganadosCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-dark-50/40 p-3 rounded-xl border border-white/5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa, correo o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          {['todos', 'nuevo', 'contactado', 'en_negociacion', 'cotizado', 'ganado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === status
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {status === 'todos' ? 'Todos' : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table / List */}
      <div className="bg-dark-50/60 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando prospectos...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No se encontraron clientes con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLeads.map((lead) => {
              const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.nuevo;
              return (
                <div
                  key={lead.id}
                  onClick={() => openLeadDetails(lead)}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-base">{lead.name}</span>
                      {lead.company && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                          <Building2 className="w-3 h-3" />
                          {lead.company}
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} font-medium`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm line-clamp-1">{lead.message}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {lead.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(lead.created_at).toLocaleDateString('es-VE')}
                      </span>
                      {lead.interactions_count ? (
                        <span className="text-brand-400 font-medium">
                          {lead.interactions_count} actividades registradas
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="text-xs text-gray-400 hidden sm:inline">Ver historial</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over / Modal for Lead Details & Follow-up History */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-dark-50 border-l border-white/10 h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-dark">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selectedLead.status]?.bg} ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </span>
                </div>
                {selectedLead.company && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedLead.company}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Contact & Status Actions */}
              <div className="bg-dark/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-brand-400" />
                      {selectedLead.email}
                    </a>
                    {selectedLead.phone && (
                      <a
                        href={`tel:${selectedLead.phone}`}
                        className="inline-flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-brand-400" />
                        {selectedLead.phone}
                      </a>
                    )}
                  </div>

                  {/* Convert to project button */}
                  {selectedLead.status !== 'ganado' ? (
                    <button
                      onClick={handleConvertToProject}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Convertir a Proyecto
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md font-medium">
                      ✓ Proyecto de Obra Creado
                    </span>
                  )}
                </div>

                {/* Change status buttons */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Cambiar estado:</span>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => handleUpdateStatus(key)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedLead.status === key
                          ? 'bg-brand-500 text-white font-semibold'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Solicitud Original del Cliente
                </h3>
                <div className="p-3 bg-dark/40 rounded-lg border border-white/5 text-sm text-gray-300">
                  {selectedLead.message}
                </div>
              </div>

              {/* Add Interaction Form */}
              <div className="bg-dark/60 p-4 rounded-xl border border-white/10 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-400" />
                  Registrar Nueva Actividad / Seguimiento
                </h3>

                <form onSubmit={handleAddInteraction} className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {['llamada', 'reunion', 'correo', 'visita_obra', 'cotizacion', 'nota'].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setInteractionType(type)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          interactionType === type
                            ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                            : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                        }`}
                      >
                        {INTERACTION_TYPES[type]?.label || type}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Escribe el resumen de la conversación, acuerdos, montos cotizados o detalles de la visita..."
                    value={interactionNotes}
                    onChange={(e) => setInteractionNotes(e.target.value)}
                    className="w-full bg-dark/80 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={submittingInteraction}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingInteraction ? 'Guardando...' : 'Guardar en Historial'}
                  </button>
                </form>
              </div>

              {/* Interactions Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Línea de Tiempo & Historial de Acciones
                </h3>

                <div className="space-y-3">
                  {selectedLead.interactions && selectedLead.interactions.length > 0 ? (
                    selectedLead.interactions.map((interaction) => {
                      const iconConfig = INTERACTION_TYPES[interaction.type] || INTERACTION_TYPES.nota;
                      const IconComponent = iconConfig.icon;

                      return (
                        <div
                          key={interaction.id}
                          className="p-3.5 bg-dark/40 rounded-xl border border-white/5 flex gap-3 text-sm"
                        >
                          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 h-fit">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-200">{iconConfig.label}</span>
                              <span className="text-gray-500">
                                {new Date(interaction.created_at).toLocaleString('es-VE')}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{interaction.notes}</p>
                            <p className="text-xs text-gray-500 pt-0.5">Por: {interaction.user_name}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aún no hay actividades registradas con este cliente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-50 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white">Registrar Nuevo Cliente / Prospecto</h2>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-dark border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  className="w-full bg-dark border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full bg-dark border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Empresa / Institución</label>
                  <input
                    type="text"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    className="w-full bg-dark border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Requerimiento o Mensaje Inicial *</label>
                <textarea
                  rows={3}
                  required
                  value={newLeadForm.message}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                  className="w-full bg-dark border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg cursor-pointer"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
