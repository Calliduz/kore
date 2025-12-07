import Hero from '@/components/features/Hero';

export default function Collections() {
    return (
        <div className="space-y-12">
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-bold tracking-tight">Our Collections</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore our thoughtfully curated series of products, designed to bring harmony and function to your space.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {['Minimalist Living', 'Workspace Essentials', 'Travel & Carry', 'Home Accessories'].map((collection, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl aspect-[16/9] cursor-pointer">
                        <img 
                            src={`https://images.unsplash.com/photo-${[
                                '1493663284031-13b1a8368c46', 
                                '1497215728101-856f4ea42174', 
                                '1553062407-98eeb64c6a62',
                                '1484101403233-564f475dc286'
                            ][i]}?auto=format&fit=crop&q=80&w=1200`}
                            alt={collection}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <h2 className="text-3xl font-bold text-white tracking-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {collection}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
