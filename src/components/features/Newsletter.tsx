import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight } from 'lucide-react';

export default function Newsletter() {
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

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="pl-10 py-6 text-base bg-background/50 backdrop-blur-sm border-2 focus-visible:ring-0 focus-visible:border-primary transition-all rounded-lg"
              />
            </div>
            <Button size="lg" className="py-6 px-8 text-base rounded-lg group">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
