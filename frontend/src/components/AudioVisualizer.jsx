import { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioRef, isPlaying }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const sourceRef = useRef(null);
    const analyzerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current) return;

        // Initialize Audio Context once
        if (!contextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            contextRef.current = new AudioContext();
            analyzerRef.current = contextRef.current.createAnalyser();
            analyzerRef.current.fftSize = 256; // Controls bar resolution

            try {
                sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyzerRef.current);
                analyzerRef.current.connect(contextRef.current.destination);
            } catch (e) {
                console.warn("Audio Context source already connected or failed.", e);
            }
        }

        // Resume context if suspended (browser autoplay policy)
        if (isPlaying && contextRef.current.state === 'suspended') {
            contextRef.current.resume();
        }
    }, [audioRef, isPlaying]);

    useEffect(() => {
        if (!isPlaying) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyzer = analyzerRef.current;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2; // Scale height

                // Gradient color based on height/frequency
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#9333ea'); // Purple
                gradient.addColorStop(1, '#ec4899'); // Pink

                ctx.fillStyle = gradient;
                // Rounded caps effect (pseudo)
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1; // Spacing
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={50}
            className="opacity-70"
        />
    );
};

export default AudioVisualizer;
