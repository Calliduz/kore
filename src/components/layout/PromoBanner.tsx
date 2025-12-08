import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-primary text-primary-foreground relative overflow-hidden"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-center text-sm font-medium relative z-10">
          <span className="flex items-center gap-2">
            Free shipping on all international orders over $150
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-primary-foreground/50" />
            <span className="hidden sm:inline-flex items-center gap-1 opacity-90 hover:opacity-100 cursor-pointer border-b border-primary-foreground/30 hover:border-primary-foreground transition-all">
              Shop Now <ArrowRight className="h-3 w-3" />
            </span>
          </span>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Close banner</span>
          </button>
        </div>
        
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -left-10 -bottom-10 w-20 h-20 bg-white blur-2xl rounded-full" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white blur-3xl rounded-full transform translate-x-10 -translate-y-10" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
