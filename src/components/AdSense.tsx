import { useEffect, useRef } from 'react';

interface AdSenseProps {
    client?: string;
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: string;
    style?: React.CSSProperties;
    layoutKey?: string;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export default function AdSense({
    client = 'ca-pub-XXXXXXXXXXXXXXXX', // Placeholder ID
    slot,
    format = 'auto',
    responsive = 'true',
    style = { display: 'block' },
    layoutKey
}: AdSenseProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // Verifica se o script do AdSense já foi carregado e se o elemento existe
            if (adRef.current && window.adsbygoogle) {
                // Verifica se já tem um anúncio dentro (para evitar duplicidade em re-renders)
                if (adRef.current.innerHTML.trim() === '') {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            }
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className="adsense-container" style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden' }}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={style}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
                data-ad-layout-key={layoutKey}
            />
        </div>
    );
}
