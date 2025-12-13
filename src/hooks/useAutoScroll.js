import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for column-by-column scrolling during drag operations
 * Uses larger edge zones and directional detection for intuitive scrolling
 */
export function useAutoScroll(containerRef) {
    const scrollAnimationRef = useRef(null);
    const isDraggingRef = useRef(false);
    const lastPointerPositionRef = useRef({ x: 0, y: 0 });
    const currentColumnIndexRef = useRef(-1);
    const isScrollingRef = useRef(false);
    const scrollCooldownRef = useRef(false);

    // Configuration - larger edge zones for easier triggering
    const config = {
        // Percentage of screen width from edge where scrolling triggers
        // 25% means the leftmost/rightmost quarter of the screen triggers scroll
        edgePercentage: 0.25,
        // Cooldown between column scrolls (ms)
        scrollCooldown: 600,
        // Scroll animation duration (ms)
        scrollDuration: 350,
    };

    // Get column elements and their positions
    const getColumnInfo = useCallback(() => {
        const container = containerRef.current;
        if (!container) return { columns: [], containerRect: null };

        const columns = Array.from(container.querySelectorAll('[data-column]'));
        const containerRect = container.getBoundingClientRect();

        return {
            columns: columns.map((col, index) => ({
                element: col,
                index,
                rect: col.getBoundingClientRect(),
                offsetLeft: col.offsetLeft,
                width: col.offsetWidth,
            })),
            containerRect,
            scrollLeft: container.scrollLeft,
            scrollWidth: container.scrollWidth,
            clientWidth: container.clientWidth,
        };
    }, [containerRef]);

    // Get current column index based on scroll position
    const getCurrentColumnFromScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return 0;

        const { columns } = getColumnInfo();
        if (columns.length === 0) return 0;

        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const scrollCenter = scrollLeft + containerWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const colCenter = col.offsetLeft + col.width / 2;
            const distance = Math.abs(scrollCenter - colCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }

        return closestIndex;
    }, [containerRef, getColumnInfo]);

    // Smooth scroll to a specific column
    const scrollToColumn = useCallback((columnIndex) => {
        const container = containerRef.current;
        if (!container || isScrollingRef.current || scrollCooldownRef.current) return;

        const { columns } = getColumnInfo();
        if (columnIndex < 0 || columnIndex >= columns.length) return;

        const targetColumn = columns[columnIndex];
        if (!targetColumn) return;

        isScrollingRef.current = true;
        scrollCooldownRef.current = true;

        // Calculate target scroll position (center the column)
        const containerWidth = container.clientWidth;
        const columnWidth = targetColumn.width;
        const columnLeft = targetColumn.offsetLeft;
        const targetScrollLeft = columnLeft - (containerWidth - columnWidth) / 2;
        
        // Clamp to valid scroll range
        const maxScroll = container.scrollWidth - container.clientWidth;
        const clampedScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft));

        // Smooth scroll animation
        container.scrollTo({
            left: clampedScrollLeft,
            behavior: 'smooth',
        });

        // Update current column
        currentColumnIndexRef.current = columnIndex;

        // Reset scrolling state after animation
        setTimeout(() => {
            isScrollingRef.current = false;
        }, config.scrollDuration);

        // Reset cooldown after delay
        setTimeout(() => {
            scrollCooldownRef.current = false;
        }, config.scrollCooldown);

    }, [containerRef, getColumnInfo, config.scrollDuration, config.scrollCooldown]);

    // Check if we should scroll based on pointer position in edge zones
    const checkScrollTrigger = useCallback(() => {
        const container = containerRef.current;
        if (!container || !isDraggingRef.current || isScrollingRef.current || scrollCooldownRef.current) {
            return;
        }

        const { x } = lastPointerPositionRef.current;
        const { columns, containerRect } = getColumnInfo();
        
        if (!containerRect || columns.length === 0) return;
        if (x === 0) return;

        // Initialize current column if needed
        if (currentColumnIndexRef.current < 0) {
            currentColumnIndexRef.current = getCurrentColumnFromScroll();
        }

        const currentIndex = currentColumnIndexRef.current;
        const containerWidth = containerRect.width;
        const edgeThreshold = containerWidth * config.edgePercentage;

        // Calculate position relative to container
        const relativeX = x - containerRect.left;

        // LEFT ZONE: leftmost 25% of screen -> scroll to previous column
        if (relativeX < edgeThreshold) {
            if (currentIndex > 0) {
                scrollToColumn(currentIndex - 1);
            }
            return;
        }

        // RIGHT ZONE: rightmost 25% of screen -> scroll to next column
        if (relativeX > containerWidth - edgeThreshold) {
            if (currentIndex < columns.length - 1) {
                scrollToColumn(currentIndex + 1);
            }
            return;
        }
    }, [containerRef, getColumnInfo, getCurrentColumnFromScroll, scrollToColumn, config.edgePercentage]);

    // Animation loop
    const animateScroll = useCallback(() => {
        if (!isDraggingRef.current) {
            scrollAnimationRef.current = null;
            return;
        }

        checkScrollTrigger();
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    }, [checkScrollTrigger]);

    // Start auto-scroll
    const startAutoScroll = useCallback(() => {
        isDraggingRef.current = true;
        isScrollingRef.current = false;
        scrollCooldownRef.current = false;
        currentColumnIndexRef.current = getCurrentColumnFromScroll();

        if (!scrollAnimationRef.current) {
            scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        }
    }, [animateScroll, getCurrentColumnFromScroll]);

    // Stop auto-scroll
    const stopAutoScroll = useCallback(() => {
        isDraggingRef.current = false;
        isScrollingRef.current = false;
        scrollCooldownRef.current = false;
        currentColumnIndexRef.current = -1;
        
        if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
            scrollAnimationRef.current = null;
        }
    }, []);

    // Update pointer position
    const updatePointerPosition = useCallback((x, y) => {
        lastPointerPositionRef.current = { x, y };
    }, []);

    // Handle drag move events
    const handleDragMove = useCallback((event) => {
        if (event.activatorEvent) {
            const activator = event.activatorEvent;
            if (activator.touches?.[0]) {
                updatePointerPosition(activator.touches[0].clientX, activator.touches[0].clientY);
            } else if (activator.clientX !== undefined) {
                updatePointerPosition(activator.clientX, activator.clientY);
            }
        }
        
        if (event.delta) {
            const currentPos = lastPointerPositionRef.current;
            updatePointerPosition(currentPos.x + event.delta.x, currentPos.y + event.delta.y);
        }
    }, [updatePointerPosition]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, []);

    return {
        startAutoScroll,
        stopAutoScroll,
        handleDragMove,
        updatePointerPosition,
    };
}

export default useAutoScroll;
