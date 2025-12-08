interface SeoProps {
    title: string;
    description?: string;
}

export const SEO = ({ 
    title, 
    description = "Premium Swiss-inspired E-commerce Store",
}: SeoProps) => {
    // In React 19, we can use document.title directly
    // For more complex SEO needs, consider react-helmet alternatives or server-side rendering
    if (typeof document !== 'undefined') {
        document.title = `${title} | Kore`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }
    }
    
    return null;
};
