"use client";

import { useEffect, useRef } from 'react';

const BiomedicalBackground = () => {
    const canvasRef = useRef(null);
    // Mouse state for subtle interaction
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let particles = [];
        let floatingParticles = [];
        let time = 0;

        // Configuration
        const particleCount = 40; // Number of base pairs
        const dnaRadius = 60; // Radius of the helix (amplitude)
        const rotationSpeed = 0.001; // Rotation speed
        const verticalSpeed = 0.0005; // Vertical flow speed
        const waveLength = 0.1; // Tightness of the twist

        // Floating particles config
        const floatingCount = 15;

        // Colors
        // Using CSS variables would be ideal, but for standalone:
        const primaryColor = { h: 180, s: 70, l: 50 }; // Cyan
        const secondaryColor = { h: 210, s: 80, l: 60 }; // Blue

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            // Main DNA Helix particles
            // We don't need to store strict state as position is function of time & index
            // But valid to pre-allocate if we had complex physics

            // Floating particles
            floatingParticles = [];
            for (let i = 0; i < floatingCount; i++) {
                floatingParticles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    speedY: Math.random() * 0.5 - 0.25,
                    speedX: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        };

        const drawHelix = () => {
            // Fade out previous frame for motion trail (optional) or clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Gradient Background
            // We can do this with CSS, but doing it here ensures it works in export
            // Or just leave clear for CSS to handle (better for performance/flexibility)
            // Let's assume transparent and let CSS handle the gradient.

            const centerX = canvas.width * 0.85; // Aligned to the right

            time += 1;

            // Arrays to store computed positions for connecting lines
            const strand1 = [];
            const strand2 = [];

            // Compute positions
            for (let i = 0; i < particleCount; i++) {
                // Determine vertical position
                // Continuous flow calculation
                const yOffset = (time * verticalSpeed * canvas.height);
                const spacing = canvas.height / (particleCount * 0.8); // 80% screen coverage density

                // We want the helix to span more than the screen height to allow scrolling
                const totalHeight = spacing * particleCount;

                // Calculate wrapped Y
                let y = (i * spacing + yOffset) % (canvas.height + 200) - 100;

                const phase = i * waveLength + time * rotationSpeed;
                const xOffset = Math.sin(phase) * dnaRadius;
                const zDepth = Math.cos(phase); // -1 (back) to 1 (front)

                const scale = 0.8 + (zDepth + 1) * 0.4; // 0.8 to 1.6
                const opacity = 0.2 + (zDepth + 1) * 0.4; // 0.2 to 1.0

                const p1 = {
                    x: centerX + xOffset,
                    y: y,
                    scale,
                    opacity,
                    z: zDepth
                };

                const p2 = {
                    x: centerX - xOffset,
                    y: y,
                    scale,
                    opacity,
                    z: -zDepth // Opposite phase? No, cos(phase + PI) = -cos(phase). 
                    // Actually if it's a double helix, the other strand is 180 degrees offset.
                    // sin(phase + PI) = -sin(phase) -> xOffset would be -xOffset. Correct.
                    // cos(phase + PI) = -cos(phase) -> zDepth is inverted. Correct.
                };

                strand1.push(p1);
                strand2.push(p2);
            }

            // Draw Background Floating Particles
            ctx.fillStyle = 'hsla(200, 50%, 80%, 0.3)';
            floatingParticles.forEach(p => {
                p.y -= p.speedY; // Float up/down
                p.x += p.speedX;

                // Wrap
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.y > canvas.height + 50) p.y = -50;
                if (p.x < -50) p.x = canvas.width + 50;
                if (p.x > canvas.width + 50) p.x = -50;

                ctx.beginPath();
                ctx.globalAlpha = p.opacity; // Separate alpha
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            // Helper to draw strand connection
            const drawConnection = (points, hue) => {
                ctx.beginPath();
                for (let i = 0; i < points.length - 1; i++) {
                    const curr = points[i];
                    const next = points[i + 1];
                    if (Math.abs(curr.y - next.y) > canvas.height * 0.5) continue; // Avoid wrap lines

                    ctx.lineWidth = 2 * curr.scale;
                    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${curr.opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(curr.x, curr.y);
                    ctx.lineTo(next.x, next.y);
                    ctx.stroke();
                }
            };

            // Draw Strands
            drawConnection(strand1, 180); // Cyan
            drawConnection(strand2, 210); // Blue

            // Draw Base Pairs (Connecting lines)
            for (let i = 0; i < particleCount; i++) {
                const p1 = strand1[i];
                const p2 = strand2[i];
                const op = Math.min(p1.opacity, p2.opacity);

                if (op > 0.2) {
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    grad.addColorStop(0, `hsla(180, 80%, 60%, ${op * 0.4})`);
                    grad.addColorStop(1, `hsla(210, 80%, 60%, ${op * 0.4})`);
                    ctx.strokeStyle = grad;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw Nucleotides (Dots)
            const drawDots = (strand, hue) => {
                strand.forEach(p => {
                    ctx.beginPath();
                    ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${p.opacity})`;
                    ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
                    ctx.fill();

                    if (p.opacity > 0.8) {
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.8)`;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            };

            drawDots(strand1, 180);
            drawDots(strand2, 210);

            animationFrameId = requestAnimationFrame(drawHelix);
        };

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            // Could influence rotation speed or offset here
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        drawHelix();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-slate-950"
            style={{
                // Fallback background if Tailwind execution is delayed or absent
                background: 'linear-gradient(to bottom right, #020617, #0f172a)'
            }}
        />
    );
};

export default BiomedicalBackground;
