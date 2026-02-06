import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon, Camera, Grid3X3, Maximize2, Download, Share2 } from 'lucide-react';

// Utility to merge Tailwind classes
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

// User's images from upload
const galleryImages = [
  {
    id: 1,
    url: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    thumbnail: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    title: 'Проект 1',
    category: 'Архитектура',
    description: 'Современный архитектурный проект с уникальным дизайном'
  },
  {
    id: 2,
    url: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    thumbnail: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    title: 'Проект 2',
    category: 'Интерьер',
    description: 'Интерьерное решение с акцентом на функциональность'
  },
  {
    id: 3,
    url: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    thumbnail: 'https://oejgkvftpbinliuopipr.supabase.co/storage/v1/object/public/assets/user_347995964/user-photo-1.jpg?',
    title: 'Проект 3',
    category: 'Пейзаж',
    description: 'Ландшафтный дизайн в гармонии с природой'
  }
];

// Categories for filter
const categories = ['Все', 'Архитектура', 'Интерьер', 'Пейзаж', 'Портрет', 'Природа'];

// SafeIcon Component
const SafeIcon = ({ name, size = 24, className = '', color }) => {
  const icons = { X, ChevronLeft, ChevronRight, ZoomIn, ImageIcon, Camera, Grid3X3, Maximize2, Download, Share2 };
  const IconComponent = icons[name] || ImageIcon;

  return <IconComponent size={size} className={className} color={color} />;
};

// Preload hook
const useImagePreloader = (images) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const promises = images.map(img =>
      new Promise((resolve) => {
        const image = new Image();
        image.src = img.url;
        image.onload = resolve;
        image.onerror = resolve;
      })
    );
    Promise.all(promises).then(() => setLoaded(true));
  }, [images]);

  return loaded;
};

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'
  const [isLoading, setIsLoading] = useState(true);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const imagesLoaded = useImagePreloader(galleryImages);

  // Filter images
  const filteredImages = selectedCategory === 'Все'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  // Loading simulation
  useEffect(() => {
    if (imagesLoaded) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [imagesLoaded]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setIsZoomed(false);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsZoomed(false);
  };

  const navigateImage = (direction) => {
    setIsZoomed(false);
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      navigateImage('next');
    } else if (diff < -threshold) {
      navigateImage('prev');
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
              />
              <span className="text-gray-400">Загрузка галереи...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md z-40 border-b border-slate-800/50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <SafeIcon name="Camera" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Фотогалерея
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700"
              title={viewMode === 'grid' ? 'Вид: Сетка' : 'Вид: Сетка'}
            >
              <SafeIcon
                name={viewMode === 'grid' ? 'Grid3X3' : 'Grid3x3'}
                size={20}
                className="text-gray-300"
              />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Визуальные
              </span>
              <br />
              <span className="text-white">истории</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
              Коллекция работ, созданных с вниманием к деталям и страстью к искусству визуального повествования
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-4 md:px-6 sticky top-[72px] z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 border',
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/25'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white border-slate-700 hover:border-slate-600'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 px-4 md:px-6 min-h-[50vh]">
        <div className="container mx-auto">
          <motion.div
            layout
            className={cn(
              'transition-all duration-500',
              viewMode === 'masonry' ? 'masonry-grid' : 'gallery-grid'
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden rounded-xl',
                    viewMode === 'masonry' ? 'masonry-item' : ''
                  )}
                  onClick={() => openLightbox(index)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Zoom icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <SafeIcon name="ZoomIn" size={24} className="text-white" />
                      </div>
                    </div>

                    {/* Info badge */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-3 py-1 bg-purple-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-2">
                        {image.category}
                      </span>
                      <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {filteredImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <SafeIcon name="Image" size={64} className="text-slate-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">В этой категории пока нет изображений</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all duration-300"
              onClick={closeLightbox}
            >
              <SafeIcon name="X" size={24} className="text-white" />
            </button>

            {/* Navigation buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
            >
              <SafeIcon name="ChevronLeft" size={28} className="text-white" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
            >
              <SafeIcon name="ChevronRight" size={28} className="text-white" />
            </button>

            {/* Image container */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 md:p-16"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative max-w-full max-h-full"
                >
                  <img
                    src={filteredImages[currentImageIndex].url}
                    alt={filteredImages[currentImageIndex].title}
                    className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-zoom-in"
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent"
            >
              <div className="container mx-auto flex items-end justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-purple-300 mb-2 border border-purple-500/30">
                    {filteredImages[currentImageIndex].category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {filteredImages[currentImageIndex].title}
                  </h3>
                  <p className="text-gray-400 mt-1 hidden md:block">
                    {filteredImages[currentImageIndex].description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 transition-all"
                    title={isZoomed ? 'Уменьшить' : 'Увеличить'}
                  >
                    <SafeIcon name={isZoomed ? 'Maximize2' : 'ZoomIn'} size={18} className="text-white" />
                  </button>
                  <span className="text-gray-400 text-sm">
                    {currentImageIndex + 1} / {filteredImages.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <SafeIcon name="Camera" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">Фотогалерея</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>© 2024 Фотогалерея</span>
              <span>Все права защищены</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;