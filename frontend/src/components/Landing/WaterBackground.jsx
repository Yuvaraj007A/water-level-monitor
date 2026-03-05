import React, { useEffect, useRef } from 'react';

const WaterBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const waves = [
            { amplitude: 40, wavelength: 0.005, speed: 0.02, color: 'rgba(59, 130, 246, 0.15)' },
            { amplitude: 30, wavelength: 0.008, speed: 0.03, color: 'rgba(56, 189, 248, 0.1)' },
            { amplitude: 50, wavelength: 0.004, speed: 0.01, color: 'rgba(29, 78, 216, 0.05)' }
        ];

        let offset = 0;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            waves.forEach((wave, index) => {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 1.5 + (mouseY * 50));

                const currentAmplitude = wave.amplitude + (mouseY * 20);
                const currentSpeed = wave.speed + (mouseX * 0.02);

                for (let x = 0; x < canvas.width; x++) {
                    const y = Math.sin(x * wave.wavelength + offset * currentSpeed) * currentAmplitude + canvas.height / 1.5 + (mouseY * 50);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();
                ctx.fillStyle = wave.color;
                ctx.fill();
            });

            offset += 1;
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50"
            style={{ filter: 'blur(20px)' }}
        />
    );
};

export default WaterBackground;
