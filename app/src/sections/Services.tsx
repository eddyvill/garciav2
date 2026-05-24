import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HardHat, PaintRoller, Zap, ClipboardCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    id: 1,
    icon: HardHat,
    title: 'Obras Civiles y Edificación',
    description:
      'Construcción de infraestructura civil, edificaciones institucionales y proyectos de gran envergadura con los más altos estándares de calidad.',
  },
  {
    id: 2,
    icon: PaintRoller,
    title: 'Remodelaciones Integrales',
    description:
      'Rehabilitación y remodelación completa de espacios, incluyendo acabados, pintura, pisos y adecuación de áreas funcionales.',
  },
  {
    id: 3,
    icon: Zap,
    title: 'Instalaciones Especializadas',
    description:
      'Sistemas eléctricos, climatización, instalaciones sanitarias y redes especializadas para todo tipo de infraestructura.',
  },
  {
    id: 4,
    icon: ClipboardCheck,
    title: 'Gestión de Proyectos',
    description:
      'Planificación, supervisión y control integral de proyectos de construcción, garantizando cumplimiento en tiempo y presupuesto.',
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current?.querySelectorAll('.service-card') || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full py-20 lg:py-28 bg-dark-50"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Servicios que{' '}
            <span className="gradient-text">Realizamos</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Soluciones integrales de construcción e infraestructura con los más altos estándares de calidad.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {servicesData.map((service) => (
            <button
              key={service.id}
              onClick={(e) => {
                e.preventDefault();
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="service-card group bg-dark border border-gray-800 rounded-2xl p-6 transition-all duration-400 hover:border-brand-500/40 hover:shadow-glow hover:-translate-y-2 cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-dark"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-500/20 transition-colors duration-300">
                <service.icon className="w-7 h-7 text-brand-400 stroke-[1.5]" />
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-brand-400 transition-colors">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
