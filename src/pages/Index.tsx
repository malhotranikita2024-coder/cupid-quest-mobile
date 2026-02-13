import { Game } from '@/components/Game';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--gradient-sky)' }}
      >
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(var(--love-pink))' }} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Game userId={user.id} onSignOut={signOut} />;
};

export default Index;
