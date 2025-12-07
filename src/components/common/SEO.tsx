import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title: string;
    description?: string;
    type?: string;
    image?: string;
}

export const SEO = ({ 
    title, 
    description = "Premium Swiss-inspired E-commerce Store", 
    type = "website",
    image = "/og-image.jpg" 
}: SeoProps) => {
    return (
        <Helmet>
            <title>{title} | Kore</title>
            <meta name="description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};
