/**
 * Application constants and configuration
 */

// Priority levels
export const PRIORITIES = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
};

export const PRIORITY_OPTIONS = [
    { value: PRIORITIES.HIGH, label: 'High' },
    { value: PRIORITIES.MEDIUM, label: 'Medium' },
    { value: PRIORITIES.LOW, label: 'Low' },
];

// Task card colors (background classes)
export const TASK_COLORS = {
    yellow: 'bg-yellow-200',
    green: 'bg-green-200',
    blue: 'bg-blue-200',
    pink: 'bg-pink-200',
    orange: 'bg-orange-200',
    purple: 'bg-purple-200',
    white: 'bg-white',
    red: 'bg-red-200',
};

export const getRandomColor = () => {
    const colors = Object.values(TASK_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
};

// Default project structure
export const DEFAULT_PROJECT = {
    id: 'default',
    name: 'My Project',
};

// Default columns for new projects
export const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'Todo' },
    { id: 'doing', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

// Sample tasks for demo
export const SAMPLE_TASKS = [
    {
        id: '1',
        columnId: 'todo',
        title: 'Admin APIs',
        content: 'List admin APIs for dashboard',
        color: TASK_COLORS.yellow,
        priority: PRIORITIES.HIGH,
    },
    {
        id: '2',
        columnId: 'todo',
        title: 'User Registration',
        content: 'Develop user registration functionality with OTP delivered on SMS after email confirmation',
        color: TASK_COLORS.green,
        priority: PRIORITIES.HIGH,
    },
    {
        id: '3',
        columnId: 'doing',
        title: 'Security Testing',
        content: 'Conduct security testing',
        color: TASK_COLORS.blue,
        priority: PRIORITIES.HIGH,
    },
    {
        id: '4',
        columnId: 'doing',
        title: 'Competitor Analysis',
        content: 'Analyze competitors',
        color: TASK_COLORS.pink,
        priority: PRIORITIES.MEDIUM,
    },
    {
        id: '5',
        columnId: 'done',
        title: 'UI Kit Docs',
        content: 'Create UI kit documentation',
        color: TASK_COLORS.orange,
        priority: PRIORITIES.LOW,
    },
];

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
    NEW_TASK: 'n',
    SEARCH: '/',
    TOGGLE_SIDEBAR: 'b',
    TOGGLE_THEME: 't',
    ESCAPE: 'Escape',
};

// DnD configuration - optimized for mobile touch
export const DND_CONFIG = {
    // Mouse: distance in pixels before drag starts
    MOUSE_ACTIVATION_DISTANCE: 8,
    // Touch: delay in ms before drag starts (250ms = clear distinction from scroll)
    TOUCH_DELAY: 250,
    // Touch: distance tolerance during delay (5px = precise, prevents accidental activation)
    TOUCH_TOLERANCE: 5,
};

// Animation durations (ms)
export const ANIMATION = {
    FAST: 150,
    NORMAL: 200,
    SLOW: 300,
    CONFETTI_DELAY: 150,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
};
