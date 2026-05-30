import React, { useEffect, useState, useRef } from 'react';
import styles from './LandingPage.module.css';
import SignupModal from '../components/SignupModal/SignupModal';
import LoginModal from '../components/LoginModal/LoginModal';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add(styles.scrollVisible);
      });
    }, { threshold: 0.1 });
    const elements = document.querySelectorAll(`.${styles.scrollHidden}`);
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

// --- ICONS ---
const BrainCircuitIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 0 0 8-8V7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v5a8 8 0 0 0 8 8Z" /><path d="M8.5 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" /><path d="M15.5 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" /><path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M12 13v1" /><path d="M12 6V5" /><path d="M15 10h1" /><path d="M8 10H7" /><path d="m14.5 12.5.5.5" /><path d="m9 13-.5.5" /><path d="m14.5 7.5.5-.5" /><path d="m9 7-.5-.5" /></svg>);
const FileTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /><path d="M18 3v4" /><path d="M21 6h-4" /></svg>);

// --- NEW: Scroll Down Arrow Component ---
const ScrollDownArrow = ({ onClick }) => (
  <div className={styles.scrollDownArrow} onClick={onClick} title="Scroll Down">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  </div>
);


// --- AESTHETIC COMPONENTS ---
const HeroVectorAnimation = () => (
  <svg viewBox="0 0 400 400" className={styles.heroVector}>
    <defs>
      <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary-indigo)" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <path d="M 50 200 Q 200 50, 350 200" stroke="url(#line-grad)" strokeWidth="1.5" fill="none" className={styles.pathDraw} style={{ animationDelay: '0s' }} />
    <path d="M 50 200 Q 200 350, 350 200" stroke="url(#line-grad)" strokeWidth="1.5" fill="none" className={styles.pathDraw} style={{ animationDelay: '1s' }} />
    <path d="M 50 200 A 150 150 0 0 1 350 200" stroke="url(#line-grad)" strokeOpacity="0.2" strokeWidth="1" fill="none" />
    <path d="M 50 200 A 150 150 0 0 0 350 200" stroke="url(#line-grad)" strokeOpacity="0.2" strokeWidth="1" fill="none" />
    <circle cx="50" cy="200" r="8" fill="var(--primary-indigo)" className={styles.pulse} />
    <circle cx="350" cy="200" r="8" fill="var(--primary-indigo)" className={styles.pulse} />
    <circle cx="200" cy="88" r="6" fill="#06b6d4" className={styles.pulse} style={{ animationDelay: '0.5s' }} />
    <circle cx="200" cy="312" r="6" fill="#06b6d4" className={styles.pulse} style={{ animationDelay: '1s' }} />
    <circle cx="200" cy="200" r="12" fill="var(--background-light)" stroke="#06b6d4" strokeWidth="1.5" />
  </svg>
);

const AIAnalysisAnimation = () => (
  <svg viewBox="0 0 400 400" className={styles.aiVector}>
    <path d="M 20 200 C 60 100, 100 300, 140 200 S 220 100, 260 200 S 340 300, 380 200" fill="none" strokeWidth="2" className={styles.waveform} />
    <circle cx="50" cy="138" r="4" className={styles.node} style={{ animationDelay: '0.1s' }} />
    <circle cx="120" cy="262" r="4" className={styles.node} style={{ animationDelay: '0.3s' }} />
    <circle cx="180" cy="138" r="4" className={styles.node} style={{ animationDelay: '0.6s' }} />
    <circle cx="240" cy="262" r="4" className={styles.node} style={{ animationDelay: '0.9s' }} />
    <circle cx="300" cy="138" r="4" className={styles.node} style={{ animationDelay: '1.2s' }} />
    <circle cx="360" cy="262" r="4" className={styles.node} style={{ animationDelay: '1.5s' }} />
    <path d="M 0 100 H 400 M 0 200 H 400 M 0 300 H 400 M 100 0 V 400 M 200 0 V 400 M 300 0 V 400" stroke="var(--border-color)" strokeWidth="1" />
  </svg>
);

const BrandItem = ({ slug, label, color, alts = [] }) => {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const candidates = [slug, ...alts];
  const current = candidates[idx];
  const onError = () => { if (idx < candidates.length - 1) setIdx(idx + 1); else setFailed(true); };
  return (<div className={styles.brandItem} title={label}>{!failed ? (<img className={styles.brandLogo} src={`https://cdn.simpleicons.org/${current}/${color}`} alt={`${label} logo`} loading="lazy" onError={onError} />) : (<div className={styles.brandFallback} aria-hidden="true">{label.charAt(0)}</div>)}</div>);
};


const LandingPage = () => {
  useScrollAnimation();

  const [scrolled, setScrolled] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollDown = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Data
  const brands = [{ slug: 'google', label: 'Google', color: '4285F4' }, { slug: 'amazon', label: 'Amazon', color: 'FF9900' }, { slug: 'microsoft', label: 'Microsoft', color: '0078D4' }, { slug: 'meta', label: 'Meta', color: '0467DF', alts: ['facebook'] }, { slug: 'stripe', label: 'Stripe', color: '635BFF' }, { slug: 'netflix', label: 'Netflix', color: 'E50914' }, { slug: 'uber', label: 'Uber', color: '000000' }, { slug: 'adobe', label: 'Adobe', color: 'FF0000' }, { slug: 'apple', label: 'Apple', color: '000000' }, { slug: 'intel', label: 'Intel', color: '0071C5' }, { slug: 'oracle', label: 'Oracle', color: 'F80000' }, { slug: 'salesforce', label: 'Salesforce', color: '00A1E0' }, { slug: 'spotify', label: 'Spotify', color: '1DB954' }, { slug: 'linkedin', label: 'LinkedIn', color: '0A66C2' }, { slug: 'github', label: 'GitHub', color: '181717' }, { slug: 'nvidia', label: 'NVIDIA', color: '76B900' }];
  const features = [{ icon: <BrainCircuitIcon />, title: 'Intelligent Job Matching', description: 'Our AI goes beyond keywords to find roles that truly match your skills, experience, and career ambitions.' }, { icon: <FileTextIcon />, title: 'Tailored AI Interviews', description: 'Ace your first impression. Our AI conducts a pre-screening interview based on the specific job requirements.' }, { icon: <SparklesIcon />, title: 'Recruiter-Ready Reports', description: 'We score and summarize your interview, giving recruiters the data they need to fast-track your application.' },];
  const steps = [{ title: 'Find Your Perfect Match', text: 'Our AI analyzes your profile and presents you with jobs where you have the highest chance of success.' }, { title: 'Take the AI Interview', text: 'Apply and complete a dynamic interview tailored to your resume and the specific job description.' }, { title: 'Get Scored & Summarized', text: 'Your performance is analyzed, scored, and compiled into a comprehensive, easy-to-read report.' }, { title: 'Fast-Track to Recruiters', text: 'Recruiters receive your scored report, allowing them to instantly see your capabilities and move you to the next round.' }];
  const testimonials = [{ name: 'Aria P.', role: 'Frontend Engineer', quote: 'The AI interview was brilliant. It asked relevant questions and the feedback helped me get to the final round. This is a game-changer.' }, { name: 'Diego M.', role: 'Data Analyst', quote: 'I used to spend weeks waiting for a reply. With Jobnexa, my scored report got a recruiter to call me the next day.' }, { name: 'Sana K.', role: 'Product Manager', quote: 'Finally, a platform that actually proves your skills upfront instead of just relying on a piece of paper. The process is fair and incredibly efficient.' }];
  const faqs = [{ q: 'How does the AI interview work?', a: 'Once you apply for a matched role, our AI generates a set of questions based on the job\'s required skills and your resume. It analyzes your spoken answers for content, clarity, and relevance, providing a comprehensive score.' }, { q: 'Do recruiters actually see my score?', a: 'Yes. The primary benefit is that recruiters receive your application along with a detailed report and score. This allows them to quickly identify top candidates and reduces their screening time, giving you a major advantage.' }, { q: 'Is my personal data kept private?', a: 'Absolutely. We use industry-standard encryption and give you full control over your data. Your interview report is only shared with the recruiter for the specific job you applied to.' }, { q: 'Is there a free version available?', a: 'Yes, you can get started for free to access core features like job matching and our basic resume builder. Upgrading unlocks the full AI interview and reporting capabilities.' }];

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={`${styles.navBox} ${scrolled ? styles.navScrolled : ''}`}>
            <a href="#" className={styles.logo}>Jobnexa</a>
            <nav className={styles.navButtons}>
              <button onClick={() => setIsLoginOpen(true)} className={`${styles.navButton} ${styles.loginButton}`}>Log In</button>
              <button onClick={() => setIsSignupOpen(true)} className={`${styles.navButton} ${styles.signupButton}`}>Get Started</button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={`${styles.heroContent} ${styles.scrollHidden}`}>
                <h1 className={styles.heroTitle}>Go From Application to Interview, Faster.</h1>
                <p className={styles.heroSubtitle}>Jobnexa doesn't just find you a job. We interview you with AI, score your skills, and deliver a report that makes recruiters notice.</p>
                <div className={styles.heroCtas}>
                  <button onClick={() => setIsSignupOpen(true)} className={styles.primaryCta}>Get Started for Free</button>
                </div>
                <div className={styles.brandsRow}>
                  <span className={styles.brandsLabel}>GET HIRED AT WORLD-CLASS COMPANIES</span>
                  <div className={styles.brandPills}>
                    <div className={styles.logoTrack}>
                      {brands.concat(brands).map((b, i) => (
                        <BrandItem key={i} slug={b.slug} label={b.label} color={b.color} alts={b.alts} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.heroArt} ${styles.scrollHidden}`}>
                <div className={styles.heroGlow}></div>
                <HeroVectorAnimation />
                <div className={`${styles.mathFormula} ${styles.formula1}`}>{'AI Skill Analysis'}</div>
                <div className={`${styles.mathFormula} ${styles.formula2}`}>{'Resume-to-Job Matching'}</div>
                <div className={`${styles.mathFormula} ${styles.formula3}`}>{'Predictive Scoring Model'}</div>
              </div>
            </div>
          </div>
          {/* --- NEW: Added scroll down arrow --- */}
          <ScrollDownArrow onClick={handleScrollDown} />
        </section>

        {/* --- Features Section --- */}
        <section ref={featuresRef} className={styles.featuresSection}>
          <div className={styles.container}>
            <div className={`${styles.sectionHeader} ${styles.scrollHidden}`}>
              <span className={styles.kicker}>Our Process</span>
              <h2 className={styles.sectionTitle}>An End-to-End Career Co-Pilot</h2>
              <p className={styles.sectionSubtitle}>We provide the intelligence to prove your worth before you even talk to a human.</p>
            </div>
            <div className={styles.featuresGrid}>
              {features.map((f, i) => (
                <div key={i} className={`${styles.featureTile} ${styles.scrollHidden}`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureText}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ... Rest of the sections remain the same ... */}
        {/* --- Workflow Section --- */}
        <section className={styles.workflowSection}>
          <div className={styles.container}>
            <div className={`${styles.sectionHeader} ${styles.scrollHidden}`}>
              <span className={styles.kicker}>How It Works</span>
              <h2 className={styles.sectionTitle}>Your Path to Getting Hired</h2>
            </div>
            <div className={styles.timeline}>
              {steps.map((s, i) => (
                <div key={i} className={`${styles.timelineItem} ${styles.scrollHidden}`} style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className={styles.timelineConnector}>
                    <div className={styles.timelineDot}></div>
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineStep}>STEP {i + 1}</span>
                    <h3 className={styles.timelineTitle}>{s.title}</h3>
                    <p className={styles.timelineText}>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- AI Interview Section --- */}
        <section className={styles.aiSection}>
          <div className={styles.container}>
            <div className={styles.aiGrid}>
              <div className={`${styles.aiContent} ${styles.scrollHidden}`}>
                <span className={styles.kicker}>AI Interview Assessment</span>
                <h2 className={styles.sectionTitle}>Impress Recruiters Before You Meet Them</h2>
                <p>Our AI analyzes the job description and your resume to conduct a realistic, role-specific interview. Prove your skills and get the feedback you need to succeed.</p>
                <ul className={styles.aiList}>
                  <li>Questions tailored to the job's needs</li>
                  <li>In-depth analysis of your answers</li>
                  <li>A scored report that highlights your strengths</li>
                </ul>
                <div className={styles.heroCtas}>
                  <button onClick={() => setIsSignupOpen(true)} className={styles.primaryCta}>Try a Demo Interview</button>
                </div>
              </div>
              <div className={`${styles.aiAnalysis} ${styles.scrollHidden}`}>
                <AIAnalysisAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section className={styles.testimonialsSection}>
          <div className={styles.container}>
            <div className={`${styles.sectionHeader} ${styles.scrollHidden}`}>
              <span className={styles.kicker}>Testimonials</span>
              <h2 className={styles.sectionTitle}>Success Stories from Our Users</h2>
            </div>
            <div className={styles.testimonialsGrid}>
              {testimonials.map((t, i) => (
                <div key={i} className={`${styles.testimonialCard} ${styles.scrollHidden}`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <p className={styles.testimonialQuote}>{t.quote}</p>
                  <div className={styles.testimonialMeta}>
                    <span className={styles.testimonialName}>{t.name}</span>
                    <span className={styles.testimonialRole}>{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className={styles.faqSection}>
          <div className={styles.container}>
            <div className={`${styles.sectionHeader} ${styles.scrollHidden}`}>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            </div>
            <div className={styles.faqGrid}>
              {faqs.map((f, i) => (
                <details key={i} className={`${styles.faqCard} ${styles.scrollHidden}`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <summary>{f.q}</summary>
                  <div><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className={styles.finalCtaSection}>
          <div className={styles.container}>
            <div className={`${styles.finalCtaCard} ${styles.scrollHidden}`}>
              <h2 className={styles.finalCtaTitle}>Ready to Fast-Track Your Career?</h2>
              <p>Stop waiting. Start proving. Create your free account and let your skills speak for themselves.</p>
              <button onClick={() => setIsSignupOpen(true)} className={styles.primaryCta}>Sign Up and Get Matched</button>
            </div>
          </div>
        </section>

      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} Jobnexa. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modals */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
    </div>
  );
};

export default LandingPage;