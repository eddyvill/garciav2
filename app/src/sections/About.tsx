import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Award, Users, Lightbulb, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal animation
      gsap.fromTo(
        imageRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content fade in
      gsap.fromTo(
        contentRef.current?.querySelectorAll('.content-item') || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Disciplina',
      description: 'Rigor, cumplimiento y orden en cada proyecto',
    },
    {
      icon: Award,
      title: 'Excelencia',
      description: 'Mejora continua y calidad garantizada',
    },
    {
      icon: Lightbulb,
      title: 'Innovación',
      description: 'Métodos modernos y ágiles',
    },
    {
      icon: Users,
      title: 'Compromiso Social',
      description: 'Impacto positivo en las comunidades',
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-brand-500/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <div ref={imageRef} className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/about-image.jpg"
                alt="Equipo García Construcciones"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 lg:right-8 bg-dark-50 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-brand-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">2015</p>
                  <p className="text-gray-400 text-sm">Año de Fundación</p>
                </div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="absolute -left-4 top-1/4 w-px h-32 bg-gradient-to-b from-brand-500 to-transparent" />
          </div>

          {/* Content Column */}
          <div ref={contentRef}>
            <div className="content-item inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              <span className="text-brand-400 text-sm font-medium">
                Sobre Nosotros
              </span>
            </div>

            <h2 className="content-item text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Nuestra{' '}
              <span className="gradient-text">Historia</span>
            </h2>

            <p className="content-item text-gray-300 text-lg leading-relaxed mb-6">
              <strong className="text-white">García Construcciones 503 C.A.</strong> nació formalmente 
              el 2 de marzo del año 2015, pero su verdadero origen se remonta mucho antes, cuando la 
              visión y el esfuerzo constante de su fundador, <strong className="text-white">Abelardo Ignacio García Vera</strong>, 
              comenzaron a trazar el camino de lo que hoy se ha consolidado como una empresa referente 
              en el sector de la construcción en Venezuela.
            </p>

            <p className="content-item text-gray-400 leading-relaxed mb-8">
              Con más de una década de experiencia personal en obras civiles, proyectos de infraestructura 
              y desarrollos urbanos, la empresa se propuso como objetivo ser más que una constructora: 
              aspiraba a convertirse en un actor relevante en el desarrollo del país.
            </p>

            {/* Quote */}
            <div className="content-item bg-dark-50 border-l-4 border-brand-500 rounded-r-xl p-6 mb-10">
              <Quote className="w-8 h-8 text-brand-500/30 mb-2" />
              <p className="text-gray-300 italic text-lg leading-relaxed">
                "Construir no es solo levantar estructuras, sino crear espacios dignos, 
                funcionales y sostenibles que mejoren la calidad de vida de las personas."
              </p>
            </div>

            {/* CTA */}
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="content-item inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-semibold transition-colors group"
            >
              Conoce nuestros servicios
              <span className="transform group-hover:translate-x-2 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Nuestros Valores
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Los principios que guían cada acción y decisión en nuestra empresa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-dark-50 border border-gray-800 hover:border-brand-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-glow card-hover"
              >
                <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <value.icon className="w-7 h-7 text-brand-500" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  {value.title}
                </h4>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
