export const templates = [
  {
    id: 'social-story',
    name: 'Social Story',
    category: 'Social Media',
    description: 'Perfect for Instagram and Facebook stories',
    thumbnail: '/templates/social-story.jpg',
    aspectRatio: '9:16',
    duration: 15,
    scenes: [
      {
        duration: 5,
        transitions: { type: 'fade', duration: 0.5 },
        elements: [
          { type: 'background', color: '#000000' },
          { type: 'text', content: 'YOUR STORY', style: 'modern-bold' }
        ]
      }
    ]
  },
  {
    id: 'product-promo',
    name: 'Product Showcase',
    category: 'Marketing',
    description: 'Highlight your products with this dynamic template',
    thumbnail: '/templates/product-promo.jpg',
    aspectRatio: '16:9',
    duration: 30,
    scenes: [
      {
        duration: 7,
        transitions: { type: 'slide', direction: 'left' },
        elements: [
          { type: 'background', gradient: ['#2E3192', '#1BFFFF'] },
          { type: 'product-placeholder', position: 'center' }
        ]
      }
    ]
  },
  {
    id: 'youtube-intro',
    name: 'YouTube Intro',
    category: 'YouTube',
    description: 'Engaging intro for your YouTube videos',
    thumbnail: '/templates/youtube-intro.jpg',
    aspectRatio: '16:9',
    duration: 10,
    scenes: [
      {
        duration: 3,
        transitions: { type: 'zoom', scale: 1.2 },
        elements: [
          { type: 'background', video: 'abstract-motion' },
          { type: 'logo-placeholder', animation: 'bounce' }
        ]
      }
    ]
  },
  {
    id: 'corporate-presentation',
    name: 'Corporate Presentation',
    category: 'Business',
    description: 'Professional template for business presentations',
    thumbnail: '/templates/corporate.jpg',
    aspectRatio: '16:9',
    duration: 60,
    scenes: [
      {
        duration: 10,
        transitions: { type: 'fade', duration: 0.8 },
        elements: [
          { type: 'background', color: '#ffffff' },
          { type: 'text', content: 'COMPANY NAME', style: 'corporate-clean' }
        ]
      }
    ]
  },
  {
    id: 'travel-vlog',
    name: 'Travel Vlog',
    category: 'Lifestyle',
    description: 'Share your adventures with this dynamic template',
    thumbnail: '/templates/travel-vlog.jpg',
    aspectRatio: '16:9',
    duration: 45,
    scenes: [
      {
        duration: 8,
        transitions: { type: 'wipe', direction: 'right' },
        elements: [
          { type: 'video-placeholder', filter: 'cinematic' },
          { type: 'text-overlay', style: 'wanderlust' }
        ]
      }
    ]
  },
  {
    id: 'podcast-visualizer',
    name: 'Podcast Visualizer',
    category: 'Audio',
    description: 'Turn your podcast into engaging video content',
    thumbnail: '/templates/podcast.jpg',
    aspectRatio: '16:9',
    duration: 300,
    scenes: [
      {
        duration: 300,
        elements: [
          { type: 'background', gradient: ['#1a1a1a', '#2a2a2a'] },
          { type: 'audio-visualizer', style: 'wave' },
          { type: 'text-overlay', content: 'NOW PLAYING', style: 'minimal' }
        ]
      }
    ]
  },
  {
    id: 'gaming-stream',
    name: 'Gaming Stream',
    category: 'Gaming',
    description: 'Professional streaming template with overlays',
    thumbnail: '/templates/gaming.jpg',
    aspectRatio: '16:9',
    duration: 0,
    scenes: [
      {
        duration: 0,
        elements: [
          { type: 'webcam-frame', position: 'top-right' },
          { type: 'chat-overlay', position: 'right' },
          { type: 'alert-box', position: 'top-center' }
        ]
      }
    ]
  },
  {
    id: 'fashion-lookbook',
    name: 'Fashion Lookbook',
    category: 'Fashion',
    description: 'Showcase your fashion collection',
    thumbnail: '/templates/fashion.jpg',
    aspectRatio: '4:5',
    duration: 30,
    scenes: [
      {
        duration: 5,
        transitions: { type: 'slide', direction: 'up' },
        elements: [
          { type: 'image-grid', layout: '2x2' },
          { type: 'text-overlay', style: 'elegant' }
        ]
      }
    ]
  }
];
