import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
    isActive: boolean;
    color?: string;
    barCount?: number;
    sensitivity?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    isActive,
    color = '#00FF88',
    barCount = 60,
    sensitivity = 1
}) => {
    const [heights, setHeights] = useState<number[]>(new Array(barCount).fill(4));

    useEffect(() => {
        let animationFrame: number;

        const update = () => {
            if (isActive) {
                setHeights(prev => prev.map(() => {
                    const random = Math.random();
                    return Math.max(10, random * 100 * sensitivity);
                }));
            } else {
                setHeights(new Array(barCount).fill(4));
            }
            animationFrame = requestAnimationFrame(update);
        };

        if (isActive) {
            animationFrame = requestAnimationFrame(update);
        } else {
            setHeights(new Array(barCount).fill(4));
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [isActive, barCount, sensitivity]);

    return (
        <div className="flex items-center justify-center gap-[3px] h-24 w-full px-6 overflow-hidden">
            {heights.map((height, i) => (
                <div
                    key={i}
                    className="w-[3px] rounded-full transition-all duration-150 ease-out"
                    style={{
                        backgroundColor: color,
                        height: `${height}%`,
                        opacity: isActive ? (0.4 + (height / 200)) : 0.2,
                        boxShadow: isActive && height > 60 ? `0 0 15px ${color}66` : 'none',
                    }}
                />
            ))}
        </div>
    );
};

export default AudioVisualizer;
