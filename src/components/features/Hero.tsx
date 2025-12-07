import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sparkles,
    title: 'Curated Selection',
    description: 'Handpicked products that meet our quality standards',
  },
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: 'Your data is protected with industry-leading encryption',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary delivery on all orders over $50',
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 -z-10" />
      
      <div className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          {/* Main Hero */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                New Collection Available
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Discover Your
                <span className="text-primary"> Perfect Style</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Explore our curated collection of minimalist, functional, and beautiful products designed for modern living.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button size="lg" className="gap-2 group">
                    Shop Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/collections">
                  <Button variant="outline" size="lg">
                    View Collections
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
                alt="Hero"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </motion.div>
          </div>
          
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
