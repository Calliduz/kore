import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '@/components/common/SEO';

const collections = [
  {
    title: 'Minimalist Living',
    description: 'Essentials for a clutter-free home.',
    image: 'https://images.unsplash.com/photo-1493663284031-13b1a8368c46?auto=format&fit=crop&q=80&w=1200',
    col: 'md:col-span-2',
    href: '/shop?category=Home'
  },
  {
    title: 'Workspace',
    description: 'Tools for focus and clarity.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
    col: 'md:col-span-1',
    href: '/shop?category=Office'
  },
  {
    title: 'Travel & Carry',
    description: 'Designed for the journey.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    col: 'md:col-span-1',
    href: '/shop?category=Travel'
  },
  {
    title: 'Tech Accessories',
    description: 'Seamless integration.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200',
    col: 'md:col-span-2',
    href: '/shop?category=Electronics'
  },
];

export default function Collections() {
    return (
        <div className="container py-12 space-y-12 animate-in fade-in duration-700">
            <SEO title="Collections" description="Explore our thoughtfully curated collections designed to bring harmony and function to your space." />
            <div className="text-center space-y-4 py-8">
                <motion.h1 
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Curated Collections
                </motion.h1>
                <motion.p 
                    className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Explore our thoughtfully curated series of products, designed to bring harmony and function to your space.
                </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {collections.map((collection, i) => (
                    <motion.div 
                        key={i} 
                        className={`${collection.col}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                    >
                        <Link 
                          to={collection.href}
                          className="group relative overflow-hidden rounded-2xl block aspect-[16/9] md:aspect-auto md:h-[400px]"
                        >
                            <img 
                                src={collection.image}
                                alt={collection.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white opacity-90 transition-opacity group-hover:opacity-100">
                                <h2 className="text-3xl font-bold tracking-tight mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-3">
                                    {collection.title}
                                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                                </h2>
                                <p className="text-white/80 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                    {collection.description}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
