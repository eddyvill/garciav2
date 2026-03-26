import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Servicios', href: '#services' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Contacto', href: '#contact' },
  ];

  const services = [
    'Infraestructura Eléctrica',
    'Espacios Institucionales',
    'Infraestructura Educativa',
    'Rehabilitación Urbana',
  ];

  return (
    <footer className="relative w-full bg-dark-50 border-t border-gray-800">
      {/* Main Footer */}
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo-full-gris (1).png" 
                alt="García Construcciones 503" 
                className="h-12 w-auto brightness-110"
              />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Construyendo el futuro de Venezuela con más de una década de 
              experiencia en obras civiles e infraestructura.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-brand-500 text-sm transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-brand-500 transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6">Servicios</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-brand-500 text-sm transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-brand-500 transition-colors" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Av. Bermúdez, sector Puerto Sucre,<br />
                  Edif. Ignacio García N°118, piso 1.<br />
                  Cumaná, estado Sucre.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <a
                  href="tel:+582934322054"
                  className="text-gray-400 hover:text-brand-500 text-sm transition-colors"
                >
                  +58 293 432 2054
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <a
                  href="mailto:info@garciaconstrucciones503.com"
                  className="text-gray-400 hover:text-brand-500 text-sm transition-colors"
                >
                  info@garciaconstrucciones503.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} García Construcciones 503, C.A. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-6">
              <span className="text-gray-500 text-sm">
                RIF: J-40546231-2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center z-50 group"
      >
        <ArrowUp className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
