import React, { useState, useEffect, useRef } from 'react';

// Custom useTypewriter hook
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      let currentIndex = 0;
      intervalId = setInterval(() => {
        currentIndex++;
        setDisplayed(text.slice(0, currentIndex));
        if (currentIndex >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const SENSITIVITY = 0.8;

  const typewriterText =
    'Glad you stopped in. Good taste tends to find us. Now, what are we building?';
  const { displayed, done } = useTypewriter(typewriterText, 38, 600);

  // Pill buttons appear 400ms after page load independent of typewriter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Seek helper preventing seek-flooding
  const seekToTarget = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    if (isSeekingRef.current) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    // Render first frame cleanly
    video.currentTime = 0.001;
    targetTimeRef.current = 0.001;
  };

  // Mouse scrub handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        targetTimeRef.current = video.currentTime;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let newTarget = targetTimeRef.current + timeOffset;
      newTarget = Math.max(0, Math.min(video.duration, newTarget));
      targetTimeRef.current = newTarget;

      seekToTarget();
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    // Touch support for mobile scrubbing
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        prevXRef.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      if (e.touches.length === 0) return;

      const currentX = e.touches[0].clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        targetTimeRef.current = video.currentTime;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let newTarget = targetTimeRef.current + timeOffset;
      newTarget = Math.max(0, Math.min(video.duration, newTarget));
      targetTimeRef.current = newTarget;

      seekToTarget();
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('hello@mainframe.co');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const navItems = ['Labs', 'Studio', 'Openings', 'Shop'];

  return (
    <div className="relative min-h-screen w-full select-none overflow-hidden text-black">
      {/* BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="/assets/aistudio/clideo_editor_2dc2092217154c87a78bbaaffb11125d_930f5562.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          objectFit: 'cover',
          objectPosition: '70% center',
        }}
      />

      {/* NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] font-medium tracking-tight text-black sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="select-none text-[25px] leading-none text-black sm:text-[30px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden items-center text-[23px] text-black md:flex"
        >
          {navItems.map((item, index) => (
            <React.Fragment key={item}>
              <button
                type="button"
                onClick={() => setActiveModal(item)}
                className="cursor-pointer transition-opacity hover:opacity-60"
              >
                {item}
              </button>
              {index < navItems.length - 1 && <span>,&nbsp;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <a
          href="mailto:hello@mainframe.co"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </a>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          className="relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${
              mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] flex flex-col justify-center px-8 gap-8 bg-white/95 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveModal(item);
            }}
            className="text-left text-[32px] font-medium text-black transition-opacity hover:opacity-60"
          >
            {item}
          </button>
        ))}
        <a
          href="mailto:hello@mainframe.co"
          onClick={() => setMobileMenuOpen(false)}
          className="text-left text-[32px] font-medium text-black underline underline-offset-4 transition-opacity hover:opacity-60"
        >
          Get in touch
        </a>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] flex h-screen w-full flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none mb-5 select-none font-normal text-black sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              filter: 'blur(4px)',
              WebkitFilter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="mb-5 min-h-[54px] font-normal text-black sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
            }}
          >
            <span>{displayed}</span>
            {!done && (
              <span
                className="animate-blink ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle"
                aria-hidden="true"
              />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveModal('Pitch us an idea')}
              className="mx-[0.2em] mb-[0.4em] inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              Pitch us an idea
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('Come work here')}
              className="mx-[0.2em] mb-[0.4em] inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              Come work here
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('Send a brief hello')}
              className="mx-[0.2em] mb-[0.4em] inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              Send a brief hello
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('See how we operate')}
              className="mx-[0.2em] mb-[0.4em] inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              See how we operate
            </button>

            {/* Outline pill button with copy icon */}
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy email"
              className="group mx-[0.2em] mb-[0.4em] inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
            >
              <span>
                Reach us:{' '}
                <span className="underline underline-offset-1">
                  {copied ? 'Copied to clipboard!' : 'hello@mainframe.co'}
                </span>
              </span>
              {/* 12x12 copy icon (inline SVG of two overlapping rectangles) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              >
                <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
                <path d="M9.5 4.5V2.5C9.5 1.94772 9.05228 1.5 8.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V8.5C1.5 9.05228 1.94772 9.5 2.5 9.5H4.5" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Interactive Modal Sheet for Navigation & Pill actions */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-lg rounded-2xl border border-black/10 bg-white p-7 text-black shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-medium tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Mainframe®
                </span>
                <span className="text-sm text-neutral-400">/</span>
                <span className="text-sm font-medium uppercase tracking-wider text-neutral-600">
                  {activeModal}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-neutral-700 hover:bg-black hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-6">
              {activeModal === 'Labs' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Mainframe Experimental Labs</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Where we prototype speculative interfaces, autonomous design systems, and
                    adaptive machine aesthetics. Exploring synthetic media, neural typography, and
                    real-time interactive canvas environments.
                  </p>
                  <div className="pt-2 text-xs uppercase tracking-widest text-neutral-400">
                    STATUS: 08 ACTIVE RESEARCH SPRINT RUNS
                  </div>
                </div>
              )}

              {activeModal === 'Studio' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Mainframe Creative Studio</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    A multidisciplinary design and technology collective partner to future-focused
                    brands worldwide. We engineer immersive identities, digital flagships, and
                    dynamic physical-digital installations.
                  </p>
                  <div className="pt-2 text-xs uppercase tracking-widest text-neutral-400">
                    LOCATION: TOKYO / SAN FRANCISCO / BERLIN
                  </div>
                </div>
              )}

              {activeModal === 'Openings' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Current Openings</h3>
                  <div className="space-y-2 pt-1">
                    {[
                      { role: 'Creative Technologist (GLSL / Three.js)', loc: 'Remote / SF' },
                      { role: 'Design Systems Lead', loc: 'Remote / Tokyo' },
                      { role: 'Autonomous Interaction Researcher', loc: 'Remote / Berlin' },
                    ].map((job) => (
                      <div
                        key={job.role}
                        className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{job.role}</span>
                        <span className="text-xs text-neutral-500">{job.loc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'Shop' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Mainframe Goods & Editions</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Limited archival objects, experimental typography specimens, and hardware
                    editions produced in micro-runs.
                  </p>
                  <div className="rounded-lg bg-neutral-100 p-3 text-xs text-neutral-700">
                    Next release drop scheduled for upcoming quarter. Sign up via brief hello.
                  </div>
                </div>
              )}

              {activeModal === 'Pitch us an idea' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Pitch Us an Idea</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Have an ambitious vision, next-gen hardware product, or radical concept? We
                    collaborate on transformative commissions and incubations.
                  </p>
                  <a
                    href="mailto:hello@mainframe.co?subject=Project%20Pitch"
                    className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                  >
                    Transmit Pitch to hello@mainframe.co
                  </a>
                </div>
              )}

              {activeModal === 'Come work here' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Work With Us</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    We welcome singular talents who obsess over detail, code craftsmanship, and
                    provocative aesthetics. Send us your portfolio or repository link.
                  </p>
                  <a
                    href="mailto:hello@mainframe.co?subject=Career%20Inquiry"
                    className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                  >
                    Send Portfolio to hello@mainframe.co
                  </a>
                </div>
              )}

              {activeModal === 'Send a brief hello' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Say Hello</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Drop a line anytime. We respond promptly to all thoughtful inquiries and
                    conversations.
                  </p>
                  <a
                    href="mailto:hello@mainframe.co?subject=Brief%20Hello"
                    className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                  >
                    Open Mail Client
                  </a>
                </div>
              )}

              {activeModal === 'See how we operate' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-medium tracking-tight">Our Operating Model</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Zero bureaucracy. Small, lethal teams of hybrid engineer-designers who ship
                    exceptional work with unprecedented velocity.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="rounded border border-neutral-100 p-2">
                      <div className="font-semibold text-black">1. Discovery & Synthesis</div>
                      <div className="text-neutral-500">Unfiltered clarity</div>
                    </div>
                    <div className="rounded border border-neutral-100 p-2">
                      <div className="font-semibold text-black">2. Code Prototyping</div>
                      <div className="text-neutral-500">Directly in medium</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="cursor-pointer text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-black"
              >
                Close ESC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
