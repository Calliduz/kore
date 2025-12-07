import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Package, User as UserIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-lg border bg-card space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Profile</h2>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Order History (Mock) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Package className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Order History</h2>
            </div>
            
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <p>No orders yet.</p>
              <p className="text-sm">When you buy something, it will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
