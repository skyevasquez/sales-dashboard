'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function WorkOSSignInButton() {
  const router = useRouter();
  
  return (
    <Button 
      onClick={() => router.push('/auth')} 
      className="gap-2" 
      size="lg"
    >
      <LogIn className="h-5 w-5" />
      Sign In with WorkOS
    </Button>
  );
}
