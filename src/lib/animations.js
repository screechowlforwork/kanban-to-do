/**
 * Framer Motion animation variants and utilities
 * Optimized for iOS Safari with native-like easing curves
 */

// iOS Native-like Easing Curves
// These curves match Apple's HIG motion guidelines
export const iosEasing = {
    // Standard iOS animation curve - most common
    standard: [0.32, 0.72, 0, 1],
    // Decelerate - for elements entering screen
    decelerate: [0.25, 0.1, 0.25, 1],
    // Accelerate - for elements leaving screen
    accelerate: [0.55, 0.085, 0.68, 0.53],
    // Spring-like bounce
    bounce: [0.68, -0.55, 0.265, 1.55],
};

// iOS Native-like Spring Presets
export const iosSpring = {
    // Gentle, natural feel - like iOS sheet presentations
    gentle: { type: 'spring', damping: 26, stiffness: 170 },
    // Quick response - for buttons and small elements
    snappy: { type: 'spring', damping: 30, stiffness: 300 },
    // Bouncy - for playful interactions
    bouncy: { type: 'spring', damping: 15, stiffness: 200 },
    // Slow, smooth - for large view transitions
    smooth: { type: 'spring', damping: 35, stiffness: 120 },
};

// Page transition variants
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.35, ease: iosEasing.standard }
};

// Fade in/out
export const fadeInOut = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: iosEasing.standard }
};

// Scale fade (for modals/dialogs) - iOS-like appearance
export const scaleFade = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: { duration: 0.25, ease: iosEasing.standard }
};

// iOS-style modal presentation (from bottom with scale)
export const modalPresentation = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: iosSpring.gentle
    },
    exit: { 
        opacity: 0, 
        y: 30, 
        scale: 0.95,
        transition: { duration: 0.2, ease: iosEasing.accelerate }
    }
};

// Slide from right (sidebars) - iOS navigation push
export const slideFromRight = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: iosSpring.gentle
};

// Slide from left (sidebars) - iOS navigation pop
export const slideFromLeft = {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: iosSpring.gentle
};

// Slide up (bottom sheets) - iOS sheet presentation
export const slideUp = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: iosSpring.gentle
};

// Stagger children container
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.08
        }
    }
};

// Stagger child items
export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: iosEasing.standard }
    }
};

// Card hover effect - with haptic-like feedback
export const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { 
        scale: 1.015, 
        y: -1,
        transition: { duration: 0.2, ease: iosEasing.standard }
    },
    tap: { 
        scale: 0.98,
        transition: { duration: 0.1 }
    }
};

// Button press effect - iOS-like immediate feedback
export const buttonPress = {
    tap: { 
        scale: 0.96,
        transition: { duration: 0.08 }
    },
    hover: { 
        scale: 1.02,
        transition: { duration: 0.15 }
    }
};

// Haptic feedback simulation - visual "pop"
export const hapticPop = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 0.95, 1.02, 1],
        transition: { duration: 0.2, ease: iosEasing.standard }
    }
};

// Success animation - checkmark with bounce
export const successPop = {
    initial: { scale: 0, opacity: 0 },
    animate: {
        scale: [0, 1.2, 1],
        opacity: 1,
        transition: { duration: 0.35, ease: iosEasing.bounce }
    }
};

// Pulse animation for notifications/alerts
export const pulse = {
    animate: {
        scale: [1, 1.03, 1],
        opacity: [1, 0.85, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

// Shimmer loading effect
export const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

// Drag feedback - more prominent for touch
export const dragFeedback = {
    dragging: {
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        rotate: 2,
        transition: { duration: 0.15, ease: iosEasing.standard }
    }
};

// Drag start animation - haptic-like "pickup"
export const dragPickup = {
    animate: {
        scale: 1.05,
        opacity: 0.9,
        transition: { duration: 0.15 }
    }
};

// Success checkmark animation
export const checkmark = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
        pathLength: 1, 
        opacity: 1,
        transition: { duration: 0.3, delay: 0.1, ease: iosEasing.standard }
    }
};

// Expand/collapse - smooth accordion
export const expandCollapse = {
    collapsed: { 
        height: 0, 
        opacity: 0,
        transition: { duration: 0.25, ease: iosEasing.accelerate }
    },
    expanded: { 
        height: 'auto', 
        opacity: 1,
        transition: { duration: 0.3, ease: iosEasing.standard }
    }
};

// Toast notification - slide up with spring
export const toastAnimation = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: iosSpring.snappy
    },
    exit: { 
        opacity: 0, 
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2, ease: iosEasing.accelerate }
    }
};

// Loading spinner fade
export const loaderFade = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1,
        transition: { duration: 0.15 }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.1 }
    }
};

// Spring presets (legacy compatibility)
export const springPresets = {
    gentle: iosSpring.gentle,
    bouncy: iosSpring.bouncy,
    snappy: iosSpring.snappy,
    slow: iosSpring.smooth
};
