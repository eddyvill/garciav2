import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

const CounterAnimation = ({ 
  end, 
  duration = 2, 
  suffix = '', 
  className = '' 
}: CounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated.current) return;

    const counter = { value: 0 };

    const animation = gsap.to(counter, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.floor(counter.value));
      },
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          hasAnimated.current = true;
        },
      },
    });

    return () => {
      animation.kill();
    };
  }, [end, duration]);

  return (
    <span ref={counterRef} className={className}>
      {count}{suffix}
    </span>
  );
};

export default CounterAnimation;
