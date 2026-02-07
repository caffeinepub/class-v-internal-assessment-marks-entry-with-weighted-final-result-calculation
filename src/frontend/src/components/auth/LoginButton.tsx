import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { isCapacitorAndroid } from '../../utils/capacitorPlatform';
import { toast } from 'sonner';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        // Show a helpful message for Android users
        if (isCapacitorAndroid()) {
          toast.info('Opening login in browser...', {
            description: 'You will be redirected back to the app after login.'
          });
        }
        
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else if (isCapacitorAndroid()) {
          toast.error('Login failed', {
            description: 'Please try again or check your internet connection.'
          });
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="default"
      className="gap-2"
    >
      {loginStatus === 'logging-in' ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
