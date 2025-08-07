"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedSectionProps = {
    children: React.ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
};

export function AnimatedSection({
    children,
    className = "",
    direction = "up",
    delay = 0,
}: AnimatedSectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const getTranslate = () => {
        switch (direction) {
            case "up":
                return "translate-y-20";
            case "down":
                return "translate-y-[-20px]";
            case "left":
                return "translate-x-20";
            case "right":
                return "translate-x-[-20px]";
            default:
                return "translate-y-20";
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible
                ? "opacity-100 transform-none"
                : `opacity-0 ${getTranslate()}`
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export function FloatingElement({
    children,
    className = "",
    amplitude = 10,
    duration = 3
}: {
    children: React.ReactNode;
    className?: string;
    amplitude?: number;
    duration?: number;
}) {
    return (
        <div
            className={`animate-floating ${className}`}
            style={{
                '--amplitude': `${amplitude}px`,
                animationDuration: `${duration}s`
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}

export function Parallax({
    children,
    speed = 10,
    className = "",
}: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}) {
    const [offsetY, setOffsetY] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const { top } = ref.current.getBoundingClientRect();
                const offset = window.scrollY;
                setOffsetY(offset);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            style={{
                transform: `translateY(${offsetY * speed * 0.01}px)`,
            }}
        >
            {children}
        </div>
    );
} 