import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Briefcase } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

interface StateData {
  name: string;
  projects: number;
  description: string;
  position: { x: string; y: string };
}

const Coverage = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { theme } = useTheme();

  const statesData: Record<string, StateData> = {
    sucre: {
      name: 'Sucre',
      projects: 8,
      description: 'Sede principal. Obras eléctricas e institucionales en Cumaná y Araya.',
      position: { x: '67%', y: '22%' }, // Extremo noreste, costa
    },
    falcon: {
      name: 'Falcón',
      projects: 3,
      description: 'Recuperación educativa en Punto Fijo (UNEXEE).',
      position: { x: '37%', y: '18%' }, // Noroeste, península
    },
    anzoategui: {
      name: 'Anzoátegui',
      projects: 2,
      description: 'Centro de alimentación en Guanta.',
      position: { x: '60%', y: '30%' }, // Este, costa norte
    },
    miranda: {
      name: 'Miranda',
      projects: 2,
      description: 'Obras institucionales en Chacao.',
      position: { x: '53%', y: '24%' }, // Centro-norte, junto a D.C.
    },
    caracas: {
      name: 'Caracas',
      projects: 6,
      description: 'Obras institucionales y administrativas.',
      position: { x: '48%', y: '22%' }, // Centro-norte, D.C./Aragua
    },
    apure: {
      name: 'Apure',
      projects: 1,
      description: 'Proyectos de infraestructura en los llanos.',
      position: { x: '42%', y: '45%' }, // Centro-sur, llanos
    },
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        document.querySelectorAll('.state-marker'),
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="coverage"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark-50"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4 text-brand-400 animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">Alcance Nacional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Cobertura y{' '}
            <span className="gradient-text">Presencia</span>
          </h2>
        </div>

        {/* Map — full width */}
        <div className="relative max-w-5xl mx-auto mb-10">
          <div className="glass rounded-3xl p-6 lg:p-8 overflow-hidden">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={theme === 'light' ? '/Mapa-gemini.jpg' : '/Gemini_Generated_Image_98sz2x98sz2x98sz.jpg'}
                alt="Mapa de Venezuela"
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${theme === 'light' ? '' : 'bg-gradient-to-b from-dark/40 via-dark/20 to-dark/60'}`} />

              {/* Markers */}
              {Object.entries(statesData).map(([key, data]) => (
                <div
                  key={key}
                  className="state-marker absolute cursor-pointer group z-10"
                  style={{ left: data.position.x, top: data.position.y, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={() => setSelectedState(key)}
                  onMouseLeave={() => setSelectedState(null)}
                >
                  <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                    <div className={`absolute inset-0 rounded-full animate-ping ${theme === 'light' ? 'bg-brand-500/30' : 'bg-brand-500/40'}`} />
                  </div>
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    selectedState === key
                      ? theme === 'light'
                        ? 'bg-white shadow-lg scale-125 border-2 border-brand-500'
                        : 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow-xl scale-125 border-2 border-white/50'
                      : theme === 'light'
                        ? 'bg-white shadow-md border-2 border-brand-500/50'
                        : 'bg-gradient-to-br from-brand-500/90 to-brand-700/90 shadow-glow border-2 border-white/30'
                  }`}>
                    <MapPin className={`w-5 h-5 drop-shadow-lg ${theme === 'light' ? 'text-brand-500' : 'text-white'}`} />
                  </div>

                  {/* Tooltip */}
                  <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                    selectedState === key ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}>
                    <div className={`px-3 py-1.5 rounded-xl border shadow-glow backdrop-blur-xl ${
                      theme === 'light'
                        ? 'bg-white border-brand-500/50'
                        : 'glass-light border-brand-500/50'
                    }`}>
                      <p className={`font-bold text-sm ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{data.name}</p>
                      <p className="text-brand-500 text-xs font-semibold">{data.projects}+ proyectos</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-brand-500/30 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-brand-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-brand-500/30 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-brand-500/30 rounded-br-lg" />
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 glass-light px-3 py-1.5 rounded-full border border-brand-500/20">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-gray-300 text-xs font-medium">Estados con presencia</span>
              </div>
              <div className="flex items-center gap-2 glass-light px-3 py-1.5 rounded-full border border-brand-500/20">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                <span className="text-gray-300 text-xs font-medium">Proyectos activos</span>
              </div>
            </div>
          </div>
        </div>

        {/* States list — horizontal pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto mb-10">
          {Object.entries(statesData).map(([key, data]) => (
            <div
              key={key}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-300 border ${
                selectedState === key
                  ? 'bg-brand-500/20 border-brand-500 shadow-glow text-white'
                  : 'bg-dark border-gray-800 hover:border-brand-500/50 text-gray-400 hover:text-white'
              }`}
              onMouseEnter={() => setSelectedState(key)}
              onMouseLeave={() => setSelectedState(null)}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${selectedState === key ? 'bg-brand-400' : 'bg-gray-600'}`} />
              <span className="font-medium text-sm">{data.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                selectedState === key ? 'bg-brand-500/30 text-brand-300' : 'bg-dark-50 text-gray-500'
              }`}>
                {data.projects}+
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Estados', value: '7+', icon: MapPin },
            { label: 'Proyectos', value: '24+', icon: Briefcase },
            { label: 'Ciudades', value: '10+', icon: MapPin },
            { label: 'Años', value: '10+', icon: Briefcase },
          ].map((stat, index) => (
            <div key={index} className="glass rounded-xl p-4 text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-brand-500/20 transition-colors">
                <stat.icon className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold text-brand-400 mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coverage;
