import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, Award, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Countup Animation Component
const AnimatedCounter = ({ endValue, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const currentValue = Math.floor(progress * (endValue - startValue) + startValue);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  return (
    <div className="flex flex-col w-full relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
              <span className="font-poppins font-semibold text-xs tracking-wider uppercase text-brand-red">
                GOVERNMENT REG. NGO: IND. SOCIETY ACT, 1860
              </span>
            </div>
            
            <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white">
              Empowering Women, <br/>
              Eradicating <span className="text-brand-red text-gradient-red">Period Poverty.</span>
            </h1>

            <p className="text-brand-grayDark text-lg max-w-lg leading-relaxed font-dmsans">
              At She Can Foundation, we believe a girl's dignity and education should never be compromised by lack of basic menstrual hygiene. We've helped over 120,000+ girls stay in school with clean kits and education.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/join-us"
                className="flex items-center space-x-2 px-8 py-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-poppins font-semibold tracking-wide shadow-xl shadow-brand-red/15 hover:shadow-brand-red/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Become a Volunteer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-poppins font-semibold tracking-wide hover:-translate-y-0.5 transition-all duration-300"
              >
                Send a Message
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Image & Glow Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group border border-white/5 bg-brand-dark">
              {/* Blended Background Image with smooth zoom micro-animation */}
              <img 
                src="/s1.avif" 
                alt="Together We Stand" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700 ease-out z-0" 
              />
              
              {/* Dark red gradient mask for outstanding text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-red/10 z-10"></div>
              
              {/* Card Content floating above the image overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                <Heart className="w-12 h-12 text-brand-red fill-brand-red mb-4 animate-pulse-subtle" />
                <h3 className="font-poppins font-bold text-2xl text-white mb-2">Together We Stand</h3>
                <p className="text-white/80 text-sm max-w-xs font-dmsans leading-relaxed">
                  "Every kit donated holds the promise of another month of school, safe and dignified."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-charcoal/30 border-y border-white/5 backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col space-y-2">
              <span className="font-poppins font-bold text-5xl text-brand-red flex items-center justify-center">
                <AnimatedCounter endValue={120000} suffix="+" />
              </span>
              <span className="font-poppins font-semibold text-white/90 text-sm tracking-wider uppercase">
                Women & Girls Supported
              </span>
              <p className="text-brand-grayDark text-xs max-w-[200px] mx-auto leading-relaxed">
                Clean sanitary kits distributed across rural villages and schools in India.
              </p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col space-y-2">
              <span className="font-poppins font-bold text-5xl text-brand-red flex items-center justify-center">
                <AnimatedCounter endValue={85} suffix="+" />
              </span>
              <span className="font-poppins font-semibold text-white/90 text-sm tracking-wider uppercase">
                Active Volunteers
              </span>
              <p className="text-brand-grayDark text-xs max-w-[200px] mx-auto leading-relaxed">
                Dedicated professionals, educators, and field organizers organizing collection drives.
              </p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col space-y-2">
              <span className="font-poppins font-bold text-5xl text-brand-red flex items-center justify-center">
                <AnimatedCounter endValue={12} suffix="+" />
              </span>
              <span className="font-poppins font-semibold text-white/90 text-sm tracking-wider uppercase">
                Campaign Districts
              </span>
              <p className="text-brand-grayDark text-xs max-w-[200px] mx-auto leading-relaxed">
                Active presence in tribal communities, schools, and urban slums in North India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Impact Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col space-y-3">
          <span className="font-poppins font-bold text-xs tracking-widest uppercase text-brand-red">
            Making a Real Difference
          </span>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white">
            Our Key Pillars of Social Impact
          </h2>
          <p className="text-brand-grayDark text-sm leading-relaxed font-dmsans">
            We operate transparently with local authorities and school boards to deliver direct aid where it is needed most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel hover:glass-panel-glow p-8 rounded-2xl transition-all duration-300 group flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-300">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-white">
              Kit Distributions
            </h3>
            <p className="text-brand-grayDark text-sm leading-relaxed">
              Providing eco-friendly biodegradable pad kits and sanitary bins directly to schools in underprivileged communities.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel hover:glass-panel-glow p-8 rounded-2xl transition-all duration-300 group flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-white">
              Dignity Workshops
            </h3>
            <p className="text-brand-grayDark text-sm leading-relaxed">
              Leading medically-guided hygiene workshops to de-stigmatize menstruation and educate young schoolgirls about their bodies.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel hover:glass-panel-glow p-8 rounded-2xl transition-all duration-300 group flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-xl text-white">
              Advocacy & Support
            </h3>
            <p className="text-brand-grayDark text-sm leading-relaxed">
              Empowering girls by training community champions to spread resources and raise emergency help queries efficiently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
