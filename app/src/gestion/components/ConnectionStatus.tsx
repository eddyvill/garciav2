import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Banner that shows when the Supabase connection is lost.
 * Pings Supabase every 30 seconds and shows/hides accordingly.
 */
function ConnectionStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkConnection = async () => {
      try {
        // Simple ping: fetch a minimal query from profiles (RLS allows select for authenticated)
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setIsOffline(!!error);
      } catch {
        setIsOffline(true);
      }
    };

    // Initial check
    checkConnection();

    // Poll every 30 seconds
    intervalId = setInterval(checkConnection, 30_000);

    return () => clearInterval(intervalId);
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>Sin conexión al servidor. Reintentando...</span>
    </div>
  );
}

export default ConnectionStatus;
