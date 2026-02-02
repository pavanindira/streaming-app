import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = "text" }) => {
    // Variants: text, circular, rectangular
    const baseClasses = "bg-white/10 overflow-hidden relative";

    const variants = {
        text: "h-4 rounded w-full",
        circular: "rounded-full",
        rectangular: "rounded-lg"
    };

    return (
        <div className={`${baseClasses} ${variants[variant]} ${className}`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
            />
        </div>
    );
};

export default Skeleton;
