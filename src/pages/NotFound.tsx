import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-[12rem] font-bold leading-none text-primary/10 select-none">
          404
        </h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 mt-[-4rem] relative z-10"
      >
        <h2 className="text-3xl font-bold tracking-tight">Pare not found</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg" variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/shop">
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back to Shop
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
