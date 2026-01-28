const partners = [
    { name: 'Google', slug: 'google', domain: 'google.com' },
    { name: 'Stability AI', slug: 'stabilityai', domain: 'stability.ai' },
    { name: 'Black Forest Labs', slug: 'flux', domain: 'blackforestlabs.ai' },
    { name: 'Nvidia', slug: 'nvidia', domain: 'nvidia.com' },
    { name: 'OpenAI', slug: 'openai', domain: 'openai.com' },
];

const LogoTicker = () => {
    // Duplicate the logos array to create a seamless infinite scroll effect
    const tickerLogos = [...partners, ...partners, ...partners, ...partners];

    return (
        <section className="py-12 border-y border-[var(--marketing-border)] overflow-hidden bg-[var(--marketing-bg)]">
            <div className="container-marketing">
                <p className="text-center text-[var(--marketing-muted)] text-sm mb-10 uppercase tracking-[0.2em] font-medium">
                    Powered by Industry-Leading Foundation Models
                </p>

                <div className="relative flex overflow-hidden">
                    <div className="animate-ticker flex flex-nowrap items-center gap-16 md:gap-24 w-max">
                        {tickerLogos.map((partner, index) => (
                            <div
                                key={`${partner.slug}-${index}`}
                                className="group flex items-center gap-4 transition-all duration-300 flex-shrink-0 whitespace-nowrap"
                            >
                                <div className="relative w-8 h-8 md:w-10 md:h-10 flex flex-shrink-0 items-center justify-center transition-all duration-300">
                                    <img
                                        src={`https://cdn.simpleicons.org/${partner.slug}/fff`}
                                        alt={partner.name}
                                        className="max-w-full max-h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-110"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.includes('google.com/s2/favicons')) {
                                                target.src = `https://www.google.com/s2/favicons?domain=${partner.domain}&sz=128`;
                                                target.classList.add('grayscale', 'invert');
                                            } else {
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLDivElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }
                                        }}
                                    />
                                    <div className="hidden absolute inset-0 w-full h-full rounded-lg bg-[var(--marketing-card)] border border-[var(--marketing-border)] items-center justify-center text-lg font-bold text-[var(--marketing-muted)] group-hover:text-[var(--marketing-accent)] transition-all">
                                        {partner.name[0]}
                                    </div>
                                </div>
                                <span className="text-lg md:text-xl font-semibold text-[var(--marketing-muted)] group-hover:text-white transition-colors whitespace-nowrap">
                                    {partner.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Gradient Fades for the edges */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--marketing-bg)] to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--marketing-bg)] to-transparent z-10" />
                </div>
            </div>
        </section>
    );
};

export default LogoTicker;
