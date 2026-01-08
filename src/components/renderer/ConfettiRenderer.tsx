import React, { useEffect, useRef, useState } from 'react';

export interface ConfettiData {
    trigger?: 'auto' | 'manual' | 'on-scroll';
    duration?: number; // in milliseconds
    particleCount?: number;
    colors?: string[];
    spread?: number; // angle spread in degrees
    origin?: {
        x?: number; // 0-1
        y?: number; // 0-1
    };
    gravity?: number;
    drift?: number;
    shapes?: ('circle' | 'square' | 'triangle')[];
    size?: 'small' | 'medium' | 'large';
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    shape: 'circle' | 'square' | 'triangle';
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
}

interface ConfettiRendererProps {
    data: ConfettiData;
    className?: string;
    onComplete?: () => void;
}

export function ConfettiRenderer({ data, className = '', onComplete }: ConfettiRendererProps) {
    const {
        trigger = 'auto',
        duration = 3000,
        particleCount = 100,
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
        spread = 360,
        origin = { x: 0.5, y: 0.5 },
        gravity = 0.5,
        drift = 0,
        shapes = ['circle', 'square', 'triangle'],
        size = 'medium'
    } = data;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Get particle size based on config
    const getParticleSize = (): number => {
        switch (size) {
            case 'small':
                return 4 + Math.random() * 4;
            case 'large':
                return 12 + Math.random() * 8;
            default:
                return 8 + Math.random() * 6;
        }
    };

    // Create particles
    const createParticles = () => {
        const canvas = canvasRef.current;
        if (!canvas) return [];

        const particles: Particle[] = [];
        const originX = (origin.x || 0.5) * canvas.width;
        const originY = (origin.y || 0.5) * canvas.height;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
            const velocity = 5 + Math.random() * 10;

            particles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * drift,
                vy: Math.sin(angle) * velocity - Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                size: getParticleSize(),
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        return particles;
    };

    // Draw particle
    const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;

        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);

        switch (particle.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'square':
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                break;

            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -particle.size / 2);
                ctx.lineTo(particle.size / 2, particle.size / 2);
                ctx.lineTo(-particle.size / 2, particle.size / 2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    };

    // Animate particles
    const animate = (startTime: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Apply gravity
            particle.vy += gravity;

            // Update rotation
            particle.rotation += particle.rotationSpeed;

            // Fade out towards the end
            particle.opacity = 1 - progress;

            // Draw particle
            drawParticle(ctx, particle);
        });

        // Continue animation or complete
        if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(() => animate(startTime));
        } else {
            setIsActive(false);
            if (onComplete) onComplete();
        }
    };

    // Start confetti
    const startConfetti = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        particlesRef.current = createParticles();

        // Start animation
        setIsActive(true);
        const startTime = Date.now();
        animate(startTime);
    };

    // Handle auto trigger
    useEffect(() => {
        if (trigger === 'auto' && !hasTriggered) {
            setTimeout(() => {
                startConfetti();
                setHasTriggered(true);
            }, 100);
        }
    }, [trigger, hasTriggered]);

    // Handle scroll trigger
    useEffect(() => {
        if (trigger !== 'on-scroll') return;

        const handleScroll = () => {
            const canvas = canvasRef.current;
            if (!canvas || hasTriggered) return;

            const rect = canvas.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                startConfetti();
                setHasTriggered(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, [trigger, hasTriggered]);

    // Cleanup animation frame
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`confetti-component ${className}`}>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-50"
                style={{ display: isActive ? 'block' : 'none' }}
            />
        </div>
    );
}

// Hook for programmatic confetti
export function useConfetti() {
    const [confettiData, setConfettiData] = useState<ConfettiData | null>(null);

    const celebrate = (options?: Partial<ConfettiData>) => {
        setConfettiData({
            trigger: 'auto',
            duration: 3000,
            particleCount: 100,
            ...options
        });

        // Reset after animation
        setTimeout(() => {
            setConfettiData(null);
        }, (options?.duration || 3000) + 100);
    };

    return {
        confettiData,
        celebrate
    };
}

export default ConfettiRenderer;
