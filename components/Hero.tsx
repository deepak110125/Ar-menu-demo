
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Settings, User, Search, X, Edit2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { CategoryConfig, SiteSettings } from '../types';

const WORLD_LANGUAGES = [
  "English", "Hindi", "Chinese", "Spanish", "Arabic", "Bengali", "French", "Russian", 
  "Portuguese", "Urdu", "Indonesian", "German", "Japanese", "Korean", "Telugu", 
  "Marathi", "Tamil", "Turkish", "Vietnamese", "Italian", "Thai", "Dutch", 
  "Greek", "Hebrew", "Persian", "Polish", "Malay", "Swedish", "Norwegian"
];

const SUGGESTED_LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu"];

const AnimatedText = React.memo(({ 
  tag: Tag, 
  text, 
  className, 
  style, 
  delay = 0 
}: { 
  tag: 'h1' | 'p' | 'div', 
  text: string, 
  className?: string, 
  style?: React.CSSProperties,
  delay?: number
}) => {
  const elRef = useRef<HTMLElement>(null);
  const [resizeKey, setResizeKey] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setResizeKey(prev => prev + 1);
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const win = window as any;
    if (elRef.current && win.SplitType && win.gsap) {
      const gsap = win.gsap;
      
      gsap.set(elRef.current, { opacity: 1 });
      const split = new win.SplitType(elRef.current, { types: 'lines' });
      
      if (split.lines) {
        split.lines.forEach((line: HTMLElement) => {
          line.style.overflow = 'hidden';
          line.style.display = 'block';
          line.innerHTML = `<div class="line-inner" style="display: block;">${line.innerHTML}</div>`;
        });

        const inners = elRef.current.querySelectorAll('.line-inner');

        gsap.fromTo(inners, 
          { 
            y: "110%", 
            rotateX: -20,
            opacity: 0 
          }, 
          {
            y: "0%",
            rotateX: 0,
            opacity: 1,
            duration: 1.6,
            ease: "expo.out",
            stagger: 0.1,
            delay: delay,
            clearProps: "all"
          }
        );
      }

      return () => {
        try { if (split && split.revert) split.revert(); } catch (e) {}
      };
    }
  }, [text, delay, resizeKey]);

  // @ts-ignore
  return <Tag ref={elRef} className={`${className} opacity-0`} style={style}>{text}</Tag>;
});

interface HeroProps {
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  config?: CategoryConfig;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  onUpdateConfig: (updates: Partial<CategoryConfig>) => void;
  translations?: Record<string, string>;
}

const Hero: React.FC<HeroProps> = ({
  isAdminMode,
  onToggleAdmin,
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  config,
  settings,
  onUpdateSettings,
  onUpdateConfig,
  translations
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSearchingLang, setIsSearchingLang] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const langSearchRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<'title' | 'tagline' | null>(null);

  const t = (txt: string) => translations?.[txt] || txt;

  // Determine parallax speed factor based on config
  const getSpeedValue = (speed: string | undefined) => {
    switch (speed) {
      case 'slow': return '0.2';
      case 'fast': return '0.6';
      default: return '0.4'; // medium
    }
  };

  // GSAP Parallax Logic
  useEffect(() => {
    const win = window as any;
    if (win.gsap && win.ScrollTrigger && heroRef.current && bgContainerRef.current) {
      const gsap = win.gsap;
      const ScrollTrigger = win.ScrollTrigger;

      // Ensure plugin is registered
      gsap.registerPlugin(ScrollTrigger);

      // Kill any previous ScrollTriggers attached to this specific hero element
      ScrollTrigger.getAll().forEach((t: any) => {
        if (t.trigger === heroRef.current) {
          t.kill();
        }
      });

      const speedAttr = heroRef.current.getAttribute('data-speed');
      const speed = parseFloat(speedAttr || '0.4');

      // Initial state: scale up background slightly to allow movement without showing edges
      gsap.set(bgContainerRef.current, { 
        yPercent: 0, 
        scale: 1.2, 
        transformOrigin: 'center center' 
      });

      // Create the scrub animation
      gsap.to(bgContainerRef.current, {
        yPercent: speed * 30, // Move down by 30% * speed factor of the container height
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top", // Animate while the hero is in view/scrolling out
          scrub: true
        }
      });

      return () => {
         // Cleanup is typically handled by killing triggers on re-render
      };
    }
  }, [config?.parallaxSpeed, settings.heroVideoUrl, config?.videoUrl, settings.heroBackgroundUrl]);

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) inputRef.current.focus();
  }, [isSearchExpanded]);

  useEffect(() => {
    if (isSearchingLang && langSearchRef.current) langSearchRef.current.focus();
  }, [isSearchingLang]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine visibility based on direction
      // Threshold of 100px before hiding starts
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const win = window as any;
    if ((selectedElement && isAdminMode) || isLangModalOpen) {
      document.body.style.overflow = 'hidden';
      if (win.lenisInstance) win.lenisInstance.stop();
    } else {
      document.body.style.overflow = '';
      if (win.lenisInstance) win.lenisInstance.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (win.lenisInstance) win.lenisInstance.start();
    };
  }, [selectedElement, isAdminMode, isLangModalOpen]);

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
  };

  const handleOpenLangModal = () => {
    setIsSearchingLang(false);
    setLangSearch('');
    setIsLangModalOpen(true);
  };

  const handleSelectLanguage = (lang: string) => {
    onLanguageChange(lang);
    setIsLangModalOpen(false);
    setLangSearch('');
    setIsSearchingLang(false);
  };

  const filteredLanguages = WORLD_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(langSearch.toLowerCase())
  );

  const stickyLabelOpacity = Math.min(1, Math.max(0, (scrollY - 200) / 100));
  const videoSource = settings.heroVideoUrl || config?.videoUrl;

  return (
    <div 
        ref={heroRef}
        className="hero relative w-full h-[560px] overflow-hidden bg-[#1A3E5D] shadow-lg"
        style={{ fontFamily: settings.primaryFont }}
        onClick={() => isAdminMode && setSelectedElement(null)}
        data-speed={getSpeedValue(config?.parallaxSpeed)}
    >
      {/* Background Container */}
      <div ref={bgContainerRef} className="hero-bg absolute inset-0 w-full h-full z-0">
        {videoSource && !settings.heroBackgroundUrl && (
            <video 
              ref={videoRef}
              muted 
              playsInline 
              autoPlay
              loop
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
            >
              <source src={videoSource} type="video/mp4" />
            </video>
        )}
        {settings.heroBackgroundUrl && (
            <img src={settings.heroBackgroundUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hero Background"/>
        )}
        <div className="absolute inset-0 bg-[#1A3E5D] transition-opacity duration-500" style={{ opacity: config ? config.overlayOpacity : 0.6 }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A3E5D]/90 via-transparent to-[#1A3E5D]/90 pointer-events-none"></div>
      </div>

      {/* Smart Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 px-6 pt-2 z-50 h-24 flex items-center justify-center transition-all duration-500 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full opacity-0'} ${scrollY > 50 ? 'bg-[#1A3E5D]/90 backdrop-blur-md shadow-md h-20' : ''}`}>
        {isSearchExpanded ? (
           <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl flex items-center p-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
             <Search size={20} className="text-slate-400 ml-3 mr-2" />
             <input ref={inputRef} type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder={t("Search dishes...")} className="flex-1 bg-transparent border-none outline-none text-slate-800 text-base h-10 placeholder-slate-400" style={{ fontFamily: settings.primaryFont }}/>
             <button onClick={handleCloseSearch} className="p-2 rounded-full hover:bg-gray-100 text-slate-500 duration-300"><X size={20} /></button>
           </div>
        ) : (
           <div className="w-full flex justify-between items-center relative">
             <div className="flex items-center gap-3">
                 <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${scrollY > 50 ? 'w-10 h-10' : 'w-16 h-16'}`}>
                    <img src={settings.logoUrl || "https://picsum.photos/100/100?random=logo"} alt="Logo" className="w-full h-full object-cover"/>
                 </div>
                 <div className="flex flex-col justify-center transition-all duration-500 transform translate-y-2" style={{ opacity: stickyLabelOpacity, transform: `translateY(${stickyLabelOpacity === 1 ? 0 : 10}px)` }}>
                    {stickyLabelOpacity > 0 && (
                        <>
                            <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase leading-none" style={{ fontFamily: settings.primaryFont }}>{t("Asian Fusion")}</span>
                            <h2 className="text-white text-lg font-bold leading-tight" style={{ fontFamily: settings.primaryFont }}>{settings.heroTitle}</h2>
                        </>
                    )}
                 </div>
             </div>
             <div className="flex items-center gap-2 -translate-y-1">
                <button onClick={() => setIsSearchExpanded(true)} className="p-2.5 rounded-full bg-[#1A3E5D]/40 backdrop-blur-md text-white hover:bg-[#1A3E5D]/60 transition-all duration-300"><Search size={18} /></button>
                <button 
                  onClick={handleOpenLangModal} 
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-[#1A3E5D]/40 backdrop-blur-md text-white text-xs font-bold hover:bg-[#1A3E5D]/60 transition-all duration-300 focus:outline-none"
                >
                  <Globe size={14} className="opacity-80" />
                  {language.length > 3 ? language.substring(0, 3).toUpperCase() : language.toUpperCase()}
                </button>
                <button 
                  onClick={onToggleAdmin}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isAdminMode ? 'bg-red-600/80 text-white' : 'bg-[#1A3E5D]/40 text-white hover:bg-[#1A3E5D]/60'}`}
                  aria-label="Toggle Admin Mode"
                >
                  {isAdminMode ? <User size={18} /> : <Settings size={18} />}
                </button>
             </div>
           </div>
        )}
      </div>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-[#1A3E5D]/80 backdrop-blur-sm" onClick={() => setIsLangModalOpen(false)} />
          <div className="relative w-full max-sm:max-w-full bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSearchingLang && (
                    <button onClick={() => setIsSearchingLang(false)} className="p-2 hover:bg-gray-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h3 className="text-xl font-black text-slate-900">{t("Select Language")}</h3>
              </div>
              <button onClick={() => setIsLangModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-6">
              {!isSearchingLang ? (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">{t("Suggested")}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {SUGGESTED_LANGUAGES.map(lang => (
                        <button 
                          key={lang}
                          onClick={() => handleSelectLanguage(lang)}
                          className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all group border-2 ${language === lang ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-100 hover:border-gray-200 text-slate-600'}`}
                        >
                          <span className={`font-bold ${language === lang ? 'text-red-700' : 'group-hover:text-slate-900'}`}>{lang}</span>
                          {language === lang && <Check size={18} className="text-red-600 animate-fadeIn" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSearchingLang(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Search size={18} />
                    {t("Search other languages")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      ref={langSearchRef}
                      type="text" 
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder={t("Search language...")}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    {filteredLanguages.map(lang => (
                      <button 
                        key={lang}
                        onClick={() => handleSelectLanguage(lang)}
                        className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all group ${language === lang ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-slate-600'}`}
                      >
                        <span className={`font-bold ${language === lang ? 'text-red-700' : 'group-hover:text-slate-900'}`}>{lang}</span>
                        {language === lang && <Check size={18} className="text-red-600 animate-fadeIn" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Content Wrapper */}
      <div ref={contentWrapperRef} className="absolute inset-0 z-10 pointer-events-none">
        {/* Hero text and tagline removed per user request */}
      </div>
    </div>
  );
};

export default Hero;
