export const TASK_COLORS = {
    yellow: "bg-yellow-200",
    green: "bg-green-200",
    blue: "bg-blue-200",
    pink: "bg-pink-200",
    orange: "bg-orange-200",
    purple: "bg-purple-200",
    white: "bg-white",
    red: "bg-red-200",
};

export const getRandomColor = () => {
    const colors = Object.values(TASK_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
};
