import { useEffect } from 'react';

interface SeoProps {
    title: string;
    description?: string;
}

export const SEO = ({ 
    title, 
    description = "Premium Swiss-inspired E-commerce Store",
}: SeoProps) => {
    useEffect(() => {
        document.title = `${title} | KORE`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }
    }, [title, description]);
    
    return null;
};

