import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, Heart, CheckCircle } from 'lucide-react';
import { GameWorldBackground } from './GameWorldBackground';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Listen for auth state changes (e.g. magic link opened in another tab)
  useEffect(() => {
    if (!sent) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthenticated(true);
      }
    });
    // Also check immediately in case session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setAuthenticated(true);
    });
    return () => subscription.unsubscribe();
  }, [sent]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const origin = window.location.origin.includes('localhost')
      ? 'https://id-preview--3bea97cb-e3f2-420a-a33b-d8e6aafd60bc.lovable.app'
      : window.location.origin;
    const redirectUrl = `${origin}/auth/confirm`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <GameWorldBackground>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
        <div className="card-love max-w-sm w-full text-center">
          {/* Title */}
          <div className="mb-6">
            <Heart className="w-12 h-12 mx-auto mb-3 animate-heart-beat" style={{ color: 'hsl(var(--love-pink))' }} />
            <h1 className="game-title text-3xl mb-2">Super Love Quest</h1>
            <p className="text-muted-foreground font-medium">Sign in to start your adventure</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-love pl-12 text-left"
                />
              </div>

              {error && (
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--destructive))' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-love w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send Magic Link ✨'
                )}
              </button>
            </form>
          ) : authenticated ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto" style={{ color: 'hsl(var(--love-pink))' }} />
              <p className="font-display font-semibold text-lg" style={{ color: 'hsl(var(--love-dark))' }}>
                ✅ Login successful! Starting your adventure…
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-love w-full"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl animate-bounce-soft">📧</div>
              <p className="font-display font-semibold text-lg" style={{ color: 'hsl(var(--love-dark))' }}>
                Check your email for a sign-in link
              </p>
              <p className="text-sm text-muted-foreground">
                Check Spam/Promotions if you don't see it
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm font-medium underline text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </GameWorldBackground>
  );
}
