import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Agrega tus logos en /public y actualiza los src aquí
const clients = [
  { id: 1, name: 'CORPOELEC', src: '/logo-corpoelec.png' },
  { id: 2, name: 'PDVSA',     src: '/logo-pdvsa.png' },
  { id: 3, name: 'Cliente 3', src: '/logo-cliente3.png' },
];

const Clients = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logosRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logosRef.current?.querySelectorAll('.client-logo') || [],
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: logosRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="clients"
      ref={sectionRef}
      className="relative w-full py-20 bg-dark-50 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">Nuestros Clientes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Clientes que han{' '}
            <span className="gradient-text">confiado en nosotros</span>
          </h2>
        </div>

        {/* Divider top */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent mb-12" />

        {/* Logos */}
        <div
          ref={logosRef}
          className="flex flex-wrap items-center justify-center gap-8 lg:gap-16"
        >
          {clients.map(({ id, name, src }) => (
            <div
              key={id}
              className="client-logo group flex items-center justify-center w-56 h-28 bg-dark border border-gray-800 hover:border-brand-500/40 rounded-2xl px-8 transition-all duration-300 hover:shadow-glow"
            >
              <img
                src={src}
                alt={name}
                className="max-h-16 max-w-full object-contain opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Divider bottom */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent mt-12" />
      </div>
    </section>
  );
};

export default Clients;
