import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Skeleton Loader for the entire page structure
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
           <Skeleton width={200} height={40} />
           <Skeleton width={100} height={40} />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-1">
              <Skeleton height={300} className="rounded-lg" />
           </div>
           <div className="md:col-span-2">
              <Skeleton height={300} className="rounded-lg" />
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
