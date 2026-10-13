import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Banner que muestra cuando el dispositivo del usuario pierde la conexión a internet.
 * Usa eventos nativos del navegador sin sobrecargar la base de datos con pings.
 */
function ConnectionStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/90 backdrop-blur-sm text-white text-sm font-medium">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>Sin conexión a internet en tu dispositivo.</span>
    </div>
  );
}

export default ConnectionStatus;
