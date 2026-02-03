import { motion } from 'framer-motion';

const Visualizer = ({ isPlaying }) => {
    return (
        <div className="flex items-end gap-1 h-full w-full mx-1">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                        background: `linear-gradient(to top, #8b5cf6, #3b82f6)`, // Purple to Blue gradient
                        opacity: 0.8
                    }}
                    animate={{
                        height: isPlaying ? ['20%', '90%', '40%', '100%', '20%'] : '15%',
                    }}
                    transition={{
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    );
};

export default Visualizer;
