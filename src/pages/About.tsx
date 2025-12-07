export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About KORE</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          KORE is a conceptual lifestyle brand dedicated to the art of essentialism. 
          We believe that better objects lead to a better life, and that clarity comes from removing the unnecessary.
        </p>
      </section>

      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
            alt="Office workspace" 
            className="w-full h-full object-cover"
        />
      </div>

      <section className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Philosophy</h2>
            <p className="text-muted-foreground">
                In a world of noise, we seek signal. Our design philosophy is rooted in the Swiss tradition of functionality, precision, and timeless aesthetics. We don't just sell products; we curate tools for a clearer, more focused life.
            </p>
        </div>
        <div className="space-y-4">
             <h2 className="text-2xl font-semibold">Sustainability</h2>
             <p className="text-muted-foreground">
                We are committed to responsible consumption. By creating durable, timeless goods, we encourage a buy-less-but-better approach. Our packaging is 100% recyclable and minimalist by design.
             </p>
        </div>
      </section>
    </div>
  );
}
