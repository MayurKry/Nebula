import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface GSAPScrollSectionProps {
    children: React.ReactNode;
    animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-right' | 'slide-in-left';
    duration?: number;
    stagger?: number;
    start?: string;
    className?: string;
}

const GSAPScrollSection: React.FC<GSAPScrollSectionProps> = ({
    children,
    animation = 'fade-in-up',
    duration = 0.8,
    stagger = 0.1,
    start = 'top 80%',
    className = ''
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const elements = sectionRef.current?.children;
        if (!elements) return;

        let fromVars: gsap.TweenVars = {
            opacity: 0,
            duration,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: sectionRef.current,
                start,
                toggleActions: 'play none none none'
            }
        };

        switch (animation) {
            case 'fade-in-up':
                fromVars.y = 50;
                break;
            case 'scale-in':
                fromVars.scale = 0.9;
                break;
            case 'slide-in-right':
                fromVars.x = 50;
                break;
            case 'slide-in-left':
                fromVars.x = -50;
                break;
        }

        gsap.from(Array.from(elements), fromVars);
    }, { scope: sectionRef });

    return (
        <div ref={sectionRef} className={className}>
            {children}
        </div>
    );
};

export default GSAPScrollSection;
