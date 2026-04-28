import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { UserRole } from '../../lib/database.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// ── Validation schema ────────────────────────────────────────────────
const createUserSchema = z.object({
  full_name: z
    .string()
    .min(1, 'El nombre completo es obligatorio')
    .max(200, 'Máximo 200 caracteres'),
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingrese un correo electrónico válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(72, 'Máximo 72 caracteres'),
  phone: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.enum(['supervisor', 'ejecucion'], {
    message: 'Seleccione un rol',
  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const ROLE_LABELS: Record<string, string> = {
  supervisor: 'Supervisor',
  ejecucion: 'Ejecución',
};

// ── Separate Supabase client for user creation (won't affect current session) ──
const supabaseUserCreation = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// ── Props ────────────────────────────────────────────────────────────
interface CreateUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

// ── Component ────────────────────────────────────────────────────────
function CreateUserForm({ open, onOpenChange, onUserCreated }: CreateUserFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: undefined,
    },
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setServerError(null);
      setCreatedUser(null);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    setServerError(null);
    setCreatedUser(null);

    try {
      // 1. Create auth user with separate client (won't affect current session)
      const { data: signUpData, error: signUpError } =
        await supabaseUserCreation.auth.signUp({
          email: data.email,
          password: data.password,
        });

      if (signUpError) {
        setServerError(mapSignUpError(signUpError.message));
        return;
      }

      if (!signUpData.user) {
        setServerError('No se pudo crear el usuario. Intente nuevamente.');
        return;
      }

      // 2. Insert profile using the main client (has admin's session for RLS)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        full_name: data.full_name,
        role: data.role as UserRole,
        email: data.email,
        phone: data.phone || null,
        avatar_url: null,
      } as any);

      if (profileError) {
        setServerError(
          'Usuario creado en autenticación pero hubo un error al crear el perfil: ' +
            profileError.message,
        );
        return;
      }

      // 3. Show success
      setCreatedUser({
        name: data.full_name,
        email: data.email,
        role: ROLE_LABELS[data.role] ?? data.role,
      });

      // Refresh the team list
      onUserCreated();
    } catch (err) {
      setServerError(
        'Error inesperado al crear el usuario. Intente nuevamente.',
      );
      console.error('CreateUserForm error:', err);
    }
  };

  const handleCreateAnother = () => {
    reset();
    setServerError(null);
    setCreatedUser(null);
  };

  const inputClasses =
    'h-10 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-50 border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-400" />
            Crear Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Crea un nuevo miembro del equipo. Recibirá un correo de confirmación
            para activar su cuenta.
          </DialogDescription>
        </DialogHeader>

        {createdUser ? (
          /* ── Success state ── */
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Usuario creado exitosamente
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {createdUser.name} ({createdUser.email}) — {createdUser.role}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Si la confirmación por correo está habilitada en Supabase, el
              usuario deberá confirmar su correo electrónico antes de poder
              iniciar sesión.
            </p>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleCreateAnother}
                className="bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
              >
                Crear otro usuario
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            {/* Nombre completo */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-gray-300">
                Nombre completo
              </Label>
              <Input
                id="full_name"
                placeholder="Ej: Juan Pérez"
                className={inputClasses}
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-red-400">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Correo electrónico */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                className={inputClasses}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className={inputClasses}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Teléfono y Rol row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teléfono */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-gray-300">
                  Teléfono{' '}
                  <span className="text-gray-500 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+58 412 1234567"
                  className={inputClasses}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Rol */}
              <div className="space-y-1.5">
                <Label className="text-gray-300">Rol</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-10 bg-dark-100/50 border-white/10 text-white focus-visible:border-brand-400 focus-visible:ring-brand-400/30">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-50 border-white/10">
                        <SelectItem
                          value="supervisor"
                          className="text-white focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          Supervisor
                        </SelectItem>
                        <SelectItem
                          value="ejecucion"
                          className="text-white focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          Ejecución
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-red-400">{errors.role.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando…
                  </>
                ) : (
                  'Crear usuario'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Error mapping ────────────────────────────────────────────────────
function mapSignUpError(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'Este correo electrónico ya está registrado.';
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'La contraseña es demasiado débil. Use al menos 6 caracteres.';
  }
  if (message.includes('valid email') || message.includes('invalid')) {
    return 'El correo electrónico no es válido.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Demasiados intentos. Espere un momento antes de intentar nuevamente.';
  }
  return `Error al crear usuario: ${message}`;
}

export default CreateUserForm;
