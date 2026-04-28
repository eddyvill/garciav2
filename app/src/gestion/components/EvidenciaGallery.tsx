import { useState, useEffect, useCallback } from 'react';
import { ImageIcon, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TaskEvidence } from '../../lib/database.types';

interface EvidenceWithUrl extends TaskEvidence {
  signedUrl: string | null;
}

interface EvidenciaGalleryProps {
  taskId: string;
  /** Incremented externally to trigger a refetch */
  refreshKey?: number;
}

function EvidenciaGallery({ taskId, refreshKey = 0 }: EvidenciaGalleryProps) {
  const [evidences, setEvidences] = useState<EvidenceWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchEvidences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('task_evidence')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const records = (data ?? []) as TaskEvidence[];

      // Generate signed URLs for each evidence
      const withUrls: EvidenceWithUrl[] = await Promise.all(
        records.map(async (record) => {
          const { data: urlData } = await supabase.storage
            .from('evidence')
            .createSignedUrl(record.file_path, 3600);

          return {
            ...record,
            signedUrl: urlData?.signedUrl ?? null,
          };
        }),
      );

      setEvidences(withUrls);
    } catch (err) {
      setError((err as Error).message || 'Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchEvidences();
  }, [fetchEvidences, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-400 py-4">{error}</p>
    );
  }

  if (evidences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-dark-100/50 p-3 mb-2">
          <ImageIcon className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm text-gray-500">Sin evidencias</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300">
        Evidencias ({evidences.length})
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidences.map((ev) => (
          <div
            key={ev.id}
            className="group relative rounded-lg border border-white/5 bg-dark-100/30 overflow-hidden cursor-pointer hover:border-white/15 transition-colors duration-200"
            onClick={() => ev.signedUrl && setSelectedImage(ev.signedUrl)}
          >
            {ev.signedUrl ? (
              <img
                src={ev.signedUrl}
                alt={ev.file_name}
                className="w-full h-28 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-28 flex items-center justify-center bg-dark-100/50">
                <ImageIcon className="h-8 w-8 text-gray-600" />
              </div>
            )}
            <div className="p-2 space-y-0.5">
              <p className="text-xs text-gray-400 truncate" title={ev.file_name}>
                {ev.file_name}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Calendar className="h-2.5 w-2.5" />
                <span>
                  {new Date(ev.uploaded_at).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Evidencia ampliada"
            className="max-w-[90vw] max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default EvidenciaGallery;
