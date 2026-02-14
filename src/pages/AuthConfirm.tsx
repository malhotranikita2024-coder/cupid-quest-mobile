import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, Heart } from 'lucide-react';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthenticated(true);
      }
    });

    // Check immediately in case session already exists from the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setAuthenticated(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-redirect after authentication detected
  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(() => navigate('/', { replace: true }), 5000);
    return () => clearTimeout(timer);
  }, [authenticated, navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Floating hearts decoration */}
      <div className="absolute top-10 left-10 text-4xl animate-float opacity-40">💕</div>
      <div className="absolute top-20 right-16 text-3xl animate-bounce-soft opacity-30">💖</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-pulse-love opacity-30">❤️</div>

      <div className="card-love max-w-sm w-full text-center">
        <Heart
          className="w-12 h-12 mx-auto mb-3 animate-heart-beat"
          style={{ color: 'hsl(var(--love-pink))' }}
        />
        <h1 className="game-title text-3xl mb-6">Super Love Quest</h1>

        {!authenticated ? (
          <div className="space-y-4">
            <Loader2
              className="w-10 h-10 mx-auto animate-spin"
              style={{ color: 'hsl(var(--love-pink))' }}
            />
            <p className="font-display font-semibold text-lg" style={{ color: 'hsl(var(--love-dark))' }}>
              Authenticating…
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your login
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle
              className="w-12 h-12 mx-auto"
              style={{ color: 'hsl(var(--love-pink))' }}
            />
            <p className="font-display font-semibold text-lg" style={{ color: 'hsl(var(--love-dark))' }}>
              ✅ Authentication done! Starting your adventure…
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="btn-love w-full"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
