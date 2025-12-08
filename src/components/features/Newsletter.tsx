import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      setIsSubscribed(true);
      toast.success('Welcome to the inner circle!', {
        description: 'You\'ll receive our latest updates and exclusive offers.',
      });
      setEmail('');
      // Reset success state after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.info('You\'re already subscribed!', {
          description: 'We\'ll keep you updated with our latest offerings.',
        });
      } else {
        toast.error('Subscription failed', {
          description: 'Please try again later.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-card border-y relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
              Join the Inner Circle
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive access to new collections, 
              private sales, and design inspiration.
            </p>
          </div>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 py-6 text-base bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-0 focus-visible:border-primary transition-all rounded-lg"
              />
            </div>
            <Button 
              size="lg" 
              className="py-6 px-8 text-base rounded-lg group min-w-[140px]"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Subscribed
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground">
            By subscribing you agree to our <a href="#" className="underline hover:text-primary">Privacy Policy</a>. 
            Unsubscribe at any time.
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
    </section>
  );
}

