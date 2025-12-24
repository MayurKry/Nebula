import { useState, useEffect } from 'react';
import { Rocket, Star, Trophy, Brain } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const GenerationGame = () => {
    const [score, setScore] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const facts = [
        "Did you know? The first AI program was written in 1951.",
        "AI models learn by finding patterns in vast amounts of data.",
        "Nebula's models are optimized for cinematic quality.",
        "Generative AI can create millions of unique variations in seconds.",
        "Your creativity + AI = Limitless possibilities."
    ];

    // Simple "Click the Star" Game
    const spawnStar = () => {
        const star = document.createElement('div');
        star.className = 'absolute w-6 h-6 text-yellow-400 cursor-pointer hover:scale-125 transition-transform z-50';
        star.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

        const card = document.querySelector('.game-card');
        if (!card) return;

        const x = Math.random() * (card.clientWidth - 40);
        const y = Math.random() * (card.clientHeight - 40);

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        star.onclick = () => {
            setScore(prev => prev + 10);
            gsap.to(star, { scale: 0, duration: 0.2, onComplete: () => star.remove() });
        };

        card.appendChild(star);

        // Auto remove after 2s
        setTimeout(() => {
            if (document.body.contains(star)) {
                gsap.to(star, { opacity: 0, duration: 0.5, onComplete: () => star.remove() });
            }
        }, 2000);
    };

    useEffect(() => {
        const gameInterval = setInterval(spawnStar, 1500);
        const factInterval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % facts.length);
        }, 4000);

        // Mock Progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + 0.5;
            });
        }, 100);

        return () => {
            clearInterval(gameInterval);
            clearInterval(factInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="game-card relative w-full h-full min-h-[300px] bg-[#141414] border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center">

            {/* Background Animation */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 space-y-6 w-full max-w-md">
                <div className="flex items-center justify-center gap-3 text-purple-400">
                    <Brain className="w-8 h-8 animate-pulse" />
                    <h3 className="text-xl font-bold text-white">Generating Excellence...</h3>
                </div>

                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 h-20 flex items-center justify-center">
                    <p className="text-gray-300 text-sm italic transition-all duration-500 ease-in-out key={factIndex}">
                        "{facts[factIndex]}"
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest font-bold">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <div className="text-xs text-gray-500 mb-2">WHILE YOU WAIT: CATCH THE STARS!</div>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 font-mono text-lg font-bold">
                        <Trophy className="w-5 h-5" />
                        <span>{score}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerationGame;
