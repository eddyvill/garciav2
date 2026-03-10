import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Zap, 
  Building, 
  GraduationCap, 
  Home,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: 1,
      icon: Zap,
      title: 'Infraestructura Eléctrica',
      percentage: '40%',
      shortDesc: 'Sedes y subestaciones CORPOELEC',
      fullDesc: 'Especialistas en rehabilitación, mantenimiento y construcción de infraestructura eléctrica. Trabajamos con CORPOELEC en sedes administrativas y subestaciones de todo el país.',
      features: [
        'Sedes CORPOELEC',
        'Subestaciones eléctricas',
        'Mantenimiento preventivo',
        'Instalaciones eléctricas',
        'Impermeabilización',
      ],
      image: '/service-electric.jpg',
    },
    {
      id: 2,
      icon: Building,
      title: 'Espacios Institucionales',
      percentage: '25%',
      shortDesc: 'Oficinas administrativas y talleres',
      fullDesc: 'Diseño y construcción de espacios institucionales funcionales y modernos. Oficinas administrativas, talleres de reparación y centros de operaciones.',
      features: [
        'Oficinas administrativas',
        'Talleres de reparación',
        'Centros de operaciones',
        'Adecuación de espacios',
        'Remodelación integral',
      ],
      image: '/service-institutional.jpg',
    },
    {
      id: 3,
      icon: GraduationCap,
      title: 'Infraestructura Educativa',
      percentage: '20%',
      shortDesc: 'Universidades y centros de formación',
      fullDesc: 'Adecuación y rehabilitación de espacios educativos. Trabajamos con universidades y centros de formación para crear ambientes de aprendizaje óptimos.',
      features: [
        'Universidades',
        'Centros de formación',
        'Adecuación de salones',
        'Laboratorios',
        'Bibliotecas',
      ],
      image: '/service-educational.jpg',
    },
    {
      id: 4,
      icon: Home,
      title: 'Rehabilitación Urbana',
      percentage: '15%',
      shortDesc: 'Centros nutricionales y comedores',
      fullDesc: 'Recuperación y modernización de espacios urbanos. Centros nutricionales, comedores institucionales y proyectos de impacto social.',
      features: [
        'Centros nutricionales',
        'Comedores institucionales',
        'Recuperación de espacios',
        'Proyectos sociales',
        'Áreas comunes',
      ],
      image: '/service-rehabilitation.jpg',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current?.querySelectorAll('.service-card') || [],
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
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
      className="relative w-full py-24 lg:py-32 bg-dark"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">
              Nuestros Servicios
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Soluciones{' '}
            <span className="gradient-text">Integrales</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Ofrecemos una amplia gama de servicios especializados para satisfacer 
            las necesidades de construcción e infraestructura en Venezuela.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="service-card group relative bg-dark-50 border border-gray-800 hover:border-brand-500/30 rounded-2xl overflow-hidden transition-all duration-500"
            >
              <div className="flex flex-col h-full">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-50 via-dark-50/50 to-transparent" />
                  
                  {/* Percentage Badge */}
                  <div className="absolute top-4 right-4 bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {service.percentage}
                  </div>
                  
                  {/* Icon Badge */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-500 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {service.fullDesc}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-300 text-sm"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-medium text-sm group/link"
                  >
                    Solicitar información
                    <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
