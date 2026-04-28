import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../components/ProtectedRoute';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';

// ── Validation schema ────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingrese un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Component ────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(getDashboardRoute(profile.role), { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    const error = await signIn(data.email, data.password);

    if (error) {
      setServerError(error);
      return;
    }

    // signIn succeeded — the auth state listener will update profile.
    // We wait briefly for the profile to load, then redirect.
    // The useEffect above handles the redirect once profile is available.
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-brand-900/40 via-dark to-dark pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo-full-gris (1).png"
            alt="García Construcciones 503"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            Iniciar Sesión
          </h1>
          <p className="text-gray-400 text-sm">
            Sistema de Gestión de Proyectos
          </p>
        </div>

        {/* Login form card — glassmorphism */}
        <div className="rounded-2xl border border-white/10 bg-dark-50/60 backdrop-blur-xl p-8 shadow-glow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {serverError}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="h-11 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="h-11 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-brand-500 hover:bg-brand-400 text-white font-medium cursor-pointer transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          García Construcciones 503 — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
