import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      content: 'Av. Bermúdez, sector Puerto Sucre,',
      subContent: 'Edif. Ignacio García N°118, piso 1. Cumaná, estado Sucre.',
    },
    {
      icon: Phone,
      title: 'Teléfonos',
      content: '+58 293 432 2054',
      subContent: '+58 414 802 0966',
    },
    {
      icon: Mail,
      title: 'Correo Electrónico',
      content: 'garciaconstrucciones503.c.a@gmail.com',
      subContent: '',
    },
    {
      icon: Clock,
      title: 'Horario de Atención',
      content: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
      subContent: 'Sábados: 8:00 AM - 12:00 PM',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Info cards animation
      gsap.fromTo(
        infoRef.current?.querySelectorAll('.info-card') || [],
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Form animation
      gsap.fromTo(
        formRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setIsSubmitting(true);

    const form = formRef.current;
    const templateParams = {
      from_name: (form.querySelector('[name="from_name"]') as HTMLInputElement)?.value,
      from_email: (form.querySelector('[name="from_email"]') as HTMLInputElement)?.value,
      phone: (form.querySelector('[name="phone"]') as HTMLInputElement)?.value,
      message: (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value,
    };

    try {
      await emailjs.send(
        'service_2df5hd9',
        'template_387pvca',
        templateParams,
        'tNeLQwwvMUwFa_Ihu'
      );
      setIsSubmitted(true);
      form.reset();
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch {
      alert('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand-500/10 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">
              Contáctanos
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para trabajar{' '}
            <span className="gradient-text">juntos?</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Conversemos sobre tu próximo proyecto. Estamos aquí para ayudarte 
            a construir el futuro.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div ref={infoRef}>
            <h3 className="text-2xl font-bold text-white mb-8">
              Información de Contacto
            </h3>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="info-card group flex items-start gap-4 p-4 bg-dark-50 border border-gray-800 hover:border-brand-500/30 rounded-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20 transition-colors">
                    <info.icon className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      {info.title}
                    </h4>
                    <p className="text-gray-300 text-sm">{info.content}</p>
                    {info.subContent && (
                      <p className="text-gray-400 text-sm">{info.subContent}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-dark-50 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Envíanos un Mensaje
            </h3>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    name="from_name"
                    placeholder="Tu nombre"
                    required
                    className="bg-dark-100 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-500 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Tu teléfono"
                    className="bg-dark-100 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-500 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  name="from_email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="bg-dark-100 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-500 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Mensaje
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Cuéntanos sobre tu proyecto..."
                  rows={4}
                  required
                  className="bg-dark-100 border-gray-700 text-white placeholder:text-gray-500 focus:border-brand-500 focus:ring-brand-500/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-6 text-lg font-semibold transition-all duration-500 ${
                  isSubmitted
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-brand-500 hover:bg-brand-600 hover:shadow-glow'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ¡Mensaje Enviado!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
