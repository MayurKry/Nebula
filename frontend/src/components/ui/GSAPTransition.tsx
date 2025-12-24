import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface GSAPTransitionProps {
    children: React.ReactNode;
    animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-right' | 'slide-in-left';
    duration?: number;
    delay?: number;
    stagger?: number;
    className?: string;
}

const GSAPTransition: React.FC<GSAPTransitionProps> = ({
    children,
    animation = 'fade-in-up',
    duration = 0.8,
    delay = 0,
    stagger = 0,
    className = ''
}) => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const elements = container.current?.children;
        if (!elements || elements.length === 0) return;

        // Default "To" State
        const toVars: gsap.TweenVars = {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration,
            delay,
            stagger,
            ease: 'power3.out',
            clearProps: 'opacity,transform,scale' // Clean up after animation
        };

        // "From" State
        let fromVars: gsap.TweenVars = {
            opacity: 0,
        };

        switch (animation) {
            case 'fade-in-up':
                fromVars.y = 40;
                break;
            case 'fade-in':
                // opacity 0 is default
                break;
            case 'scale-in':
                fromVars.scale = 0.8;
                break;
            case 'slide-in-right':
                fromVars.x = 40;
                break;
            case 'slide-in-left':
                fromVars.x = -40;
                break;
        }

        gsap.fromTo(Array.from(elements), fromVars, toVars);
    }, { scope: container });

    return (
        <div ref={container} className={className}>
            {children}
        </div>
    );
};

export default GSAPTransition;
