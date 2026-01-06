
import React, { useEffect, useRef } from 'react';

const ScrollLineAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const win = window as any;

    // Ensure libraries are loaded
    if (win.gsap && win.ScrollTrigger && win.Lenis) {
      const gsap = win.gsap;
      const ScrollTrigger = win.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis for smooth scrolling if not already active
      if (!win.lenisInstance) {
        const lenis = new win.Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        win.lenisInstance = lenis;

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      const path = pathRef.current;
      const dot = dotRef.current;
      
      if (path && dot) {
        // Calculate total length of the path
        const length = path.getTotalLength();

        // Initial setup: Hide path, place dot at start
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        // Get starting point to position dot initially
        const startPoint = path.getPointAtLength(0);
        gsap.set(dot, {
            attr: { cx: startPoint.x, cy: startPoint.y }
        });

        // Create Timeline linked to Scroll
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });

        // Animate stroke and dot position together
        tl.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          onUpdate: function() {
            // "this" refers to the tween instance
            const progress = this.progress();
            // Calculate point along the path based on progress
            const point = path.getPointAtLength(length * progress);
            
            if (dot) {
                dot.setAttribute("cx", point.x.toString());
                dot.setAttribute("cy", point.y.toString());
            }
          }
        });

        // Add ResizeObserver to refresh ScrollTrigger when page height changes 
        // (e.g., accordion expansion), ensuring the scroll line stays synced.
        const resizeObserver = new ResizeObserver(() => {
           ScrollTrigger.refresh();
        });
        resizeObserver.observe(document.body);

        return () => {
          resizeObserver.disconnect();
          tl.kill();
        };
      }
    }
  }, []);

  return (
    <div 
        ref={containerRef}
        className="fixed bottom-0 -right-5 z-0 h-[600px] w-48 pointer-events-none"
        aria-hidden="true"
    >
      <svg 
        className="w-full h-full overflow-visible"
        viewBox="0 0 192 600" 
      >
        <path 
          ref={pathRef}
          d="M 96 600 C -50 200, 150 100, 150 250 C 150 450, -350 550, -350 350 C -350 150, 0 50, 96 0"
          stroke="#A1D6E2" 
          strokeWidth="160"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle 
            ref={dotRef}
            r="40"
            fill="#A1D6E2"
            className="shadow-2xl"
        />
      </svg>
    </div>
  );
};

export default ScrollLineAnimation;
