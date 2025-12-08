import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="container max-w-4xl mx-auto space-y-20 py-16 animate-in fade-in duration-700">
      <section className="text-center space-y-8">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
        >
             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Essentialism</h1>
             <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                KORE is a conceptual lifestyle brand dedicated to the art of fewer, better things. 
            </p>
        </motion.div>
      </section>

      <motion.div 
        className="aspect-video rounded-3xl overflow-hidden bg-muted shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070" 
            alt="Office workspace" 
            className="w-full h-full object-cover"
        />
      </motion.div>

      <section className="grid md:grid-cols-2 gap-16">
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl font-bold">Our Philosophy</h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
            <p className="text-muted-foreground text-lg leading-relaxed">
                In a world of noise, we seek signal. Our design philosophy is rooted in the Swiss tradition of functionality, precision, and timeless aesthetics. We don't just sell products; we curate tools for a clearer, more focused life.
            </p>
        </motion.div>
        
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
             <h2 className="text-3xl font-bold">Sustainability</h2>
             <div className="h-1 w-20 bg-primary rounded-full" />
             <p className="text-muted-foreground text-lg leading-relaxed">
                We are committed to responsible consumption. By creating durable, timeless goods, we encourage a buy-less-but-better approach. Our packaging is 100% recyclable and minimalist by design.
             </p>
        </motion.div>
      </section>

      <section className="bg-muted/30 rounded-3xl p-12 text-center space-y-8">
           <h3 className="text-2xl font-semibold">Ready to simplify?</h3>
           <p className="text-muted-foreground max-w-xl mx-auto">
             Join our community of like-minded individuals who appreciate quality over quantity.
           </p>
      </section>
    </div>
  );
}
