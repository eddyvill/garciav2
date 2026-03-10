import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Building2, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const milestones = [
    {
      year: '2016',
      title: 'Fundación de la Empresa',
      description: 'INVERSIONES TR GROUP, C.A. nace en Puerto La Cruz, Anzoátegui, con la visión de brindar servicios integrales a la industria venezolana.',
      icon: Building2,
      side: 'left',
    },
    {
      year: '2017',
      title: 'Primeros Contratos Petroleros',
      description: 'Consolidamos nuestras primeras alianzas comerciales con empresas del sector petrolero, incluyendo contratos con METOR y Pequiven.',
      icon: Users,
      side: 'right',
    },
    {
      year: '2022',
      title: 'Expansión de Servicios',
      description: 'Ampliamos nuestra cartera de servicios incluyendo transporte especializado y aumentamos nuestra flota de vehículos y maquinaria.',
      icon: Award,
      side: 'left',
    },
    {
      year: '2024',
      title: 'Consolidación RNC',
      description: 'Nos consolidamos como contratista habilitado ante el Registro Nacional de Contratistas (RNC), fortaleciendo nuestra posición en el mercado.',
      icon: Calendar,
      side: 'right',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the timeline path
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          },
        });
      }

      // Animate milestone cards
      const cards = timelineRef.current?.querySelectorAll('.milestone-card');
      cards?.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            x: index % 2 === 0 ? -50 : 50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Animate nodes
      const nodes = timelineRef.current?.querySelectorAll('.timeline-node');
      nodes?.forEach((node, index) => {
        gsap.fromTo(
          node,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark-300 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">
              Nuestra Trayectoria
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Camino hacia la{' '}
            <span className="gradient-text">Excelencia</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Más de 8 años de crecimiento constante, superando desafíos y
            construyendo relaciones sólidas con nuestros clientes.
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative max-w-5xl mx-auto">
          {/* SVG Path */}
          <svg
            className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 hidden lg:block"
            viewBox="0 0 4 100"
            preserveAspectRatio="none"
          >
            <path
              ref={pathRef}
              d="M 2 0 L 2 100"
              stroke="#ff6b35"
              strokeWidth="0.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </svg>

          {/* Mobile Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500 via-brand-500/50 to-transparent lg:hidden" />

          {/* Milestones */}
          <div className="space-y-12 lg:space-y-0">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative lg:grid lg:grid-cols-2 lg:gap-8 ${
                  index !== milestones.length - 1 ? 'lg:mb-16' : ''
                }`}
              >
                {/* Node - Desktop */}
                <div
                  className={`timeline-node absolute left-1/2 top-0 -translate-x-1/2 hidden lg:flex items-center justify-center z-10`}
                >
                  <div className="w-16 h-16 bg-dark-100 border-2 border-brand-500 rounded-full flex items-center justify-center node-pulse">
                    <milestone.icon className="w-7 h-7 text-brand-500" />
                  </div>
                </div>

                {/* Node - Mobile */}
                <div className="timeline-node absolute left-4 top-0 -translate-x-1/2 lg:hidden flex items-center justify-center z-10">
                  <div className="w-10 h-10 bg-dark-100 border-2 border-brand-500 rounded-full flex items-center justify-center">
                    <milestone.icon className="w-5 h-5 text-brand-500" />
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`milestone-card ml-12 lg:ml-0 ${
                    milestone.side === 'left'
                      ? 'lg:pr-20 lg:text-right'
                      : 'lg:col-start-2 lg:pl-20'
                  }`}
                >
                  <div
                    className={`bg-dark-50 border border-gray-800 hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-500 card-hover ${
                      milestone.side === 'left' ? 'lg:ml-auto' : ''
                    }`}
                  >
                    {/* Year Badge */}
                    <div
                      className={`inline-flex items-center gap-2 bg-brand-500/10 rounded-full px-4 py-1.5 mb-4 ${
                        milestone.side === 'left' ? 'lg:ml-auto' : ''
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-brand-500" />
                      <span className="text-brand-400 font-semibold">
                        {milestone.year}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      {milestone.title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '8+', label: 'Años de Experiencia' },
            { value: '50+', label: 'Proyectos Completados' },
            { value: '20+', label: 'Clientes Satisfechos' },
            { value: '100%', label: 'Compromiso Venezolano' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-dark-50 border border-gray-800 rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all duration-300"
            >
              <p className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
