import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'icon.png',
                'apple-touch-icon.png',
                'masked-icon.svg'
            ],
            manifest: {
                name: 'Antigravity Kanban',
                short_name: 'Kanban',
                description: 'Premium task management with beautiful Kanban boards. Organize your work with drag-and-drop simplicity.',
                theme_color: '#0F0F12',
                background_color: '#0F0F12',
                display: 'standalone',
                orientation: 'any',
                scope: '/',
                start_url: '/',
                categories: ['productivity', 'utilities'],
                icons: [
                    {
                        src: 'icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                screenshots: [
                    {
                        src: 'icon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Kanban Board'
                    }
                ],
                shortcuts: [
                    {
                        name: 'New Task',
                        short_name: 'New',
                        description: 'Create a new task',
                        url: '/?action=new-task',
                        icons: [{ src: 'icon.png', sizes: '192x192' }]
                    }
                ],
                related_applications: [],
                prefer_related_applications: false
            },
            workbox: {
                // Cache strategies
                runtimeCaching: [
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Cache font files
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ],
                // Pre-cache important routes
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Skip waiting for new service worker
                skipWaiting: true,
                clientsClaim: true
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    build: {
        // Optimize chunk size
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-utils': ['uuid', 'clsx', 'tailwind-merge', 'canvas-confetti']
                }
            }
        },
        // Enable source maps for debugging
        sourcemap: false,
        // Minification
        minify: 'esbuild'
    },
    // Optimize dev server
    server: {
        host: true,
        port: 5173
    }
});
