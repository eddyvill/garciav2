import { useState, useCallback, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { validateEvidence } from '../utils/validation';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import type { TaskEvidence } from '../../lib/database.types';

interface EvidenciaUploaderProps {
  taskId: string;
  onUploaded?: (evidence: TaskEvidence) => void;
}

function EvidenciaUploader({ taskId, onUploaded }: EvidenciaUploaderProps) {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setSuccess(false);

    const isValid = validateEvidence({
      mime_type: file.type,
      file_size: file.size,
    });

    if (!isValid) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Solo se permiten imágenes JPEG o PNG');
      } else if (file.size > 10_485_760) {
        setError('El archivo excede el tamaño máximo de 10 MB');
      } else {
        setError('Archivo no válido');
      }
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !profile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${taskId}/${timestamp}_${safeName}`;

      // Simulate progress since Supabase JS doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(storagePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setProgress(90);

      // Create record in task_evidence table
      const { data: evidenceData, error: insertError } = await supabase
        .from('task_evidence')
        .insert({
          task_id: taskId,
          uploaded_by: profile.id,
          file_path: storagePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type as 'image/jpeg' | 'image/png',
        } as any)
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setProgress(100);
      setSuccess(true);

      if (evidenceData && evidenceData.length > 0 && onUploaded) {
        onUploaded(evidenceData[0] as TaskEvidence);
      }

      // Reset after a short delay
      setTimeout(() => {
        resetState();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'Error al subir la evidencia');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, profile, taskId, onUploaded, resetState]);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300">Subir Evidencia</h4>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 cursor-pointer ${
          isDragOver
            ? 'border-brand-400 bg-brand-500/10'
            : selectedFile
              ? 'border-white/20 bg-dark-100/30'
              : 'border-white/10 bg-dark-100/20 hover:border-white/20 hover:bg-dark-100/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="space-y-3">
            <div className="relative mx-auto w-fit">
              <img
                src={preview}
                alt="Vista previa"
                className="max-h-40 rounded-lg object-contain"
              />
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-dark-50 border border-white/10 p-1 text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[200px] mx-auto">
              {selectedFile?.name}
            </p>
            <p className="text-xs text-gray-500">
              {selectedFile
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-fit rounded-full bg-dark-100/50 p-3">
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400">
              Arrastra una imagen aquí o{' '}
              <span className="text-brand-400">selecciona un archivo</span>
            </p>
            <p className="text-xs text-gray-500">JPEG o PNG, máximo 10 MB</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Subiendo...</span>
            <span className="text-brand-300">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/5" />
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>Evidencia subida correctamente</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Upload button */}
      {selectedFile && !uploading && !success && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleUpload();
          }}
          disabled={uploading}
          className="w-full bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
        >
          <Upload className="h-4 w-4" />
          Subir Evidencia
        </Button>
      )}

      {uploading && (
        <Button
          disabled
          className="w-full bg-brand-500/50 text-white/70"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo...
        </Button>
      )}
    </div>
  );
}

export default EvidenciaUploader;
