import { motion } from 'framer-motion';

const Visualizer = ({ isPlaying }) => {
    return (
        <div className="flex items-end gap-0.5 h-4 mx-2">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-green-500 rounded-t-sm"
                    animate={{
                        height: isPlaying ? ['20%', '100%', '50%', '80%', '20%'] : '10%',
                    }}
                    transition={{
                        duration: 0.4 + i * 0.1,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

export default Visualizer;
