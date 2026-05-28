import React from 'react';
import { Heart, ShieldAlert, Award, Globe, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Our Mission",
      desc: "To break menstrual hygiene barriers, end period poverty, and ensure that every schoolgirl has the opportunity to stay in school and excel."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Our Vision",
      desc: "A world where clean hygiene resources, physical safety, and education are universally accessible to every young woman without shame or stigma."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Core Commitment",
      desc: "Delivering real, direct impact. Keeping processes highly transparent, auditable, and locally driven by community leaders."
    }
  ];

  const milestones = [
    {
      year: "2021",
      title: "Foundation Born",
      desc: "Started by a group of passionate advocates after recognizing the extreme drop-out rates of young girls in North India due to periods."
    },
    {
      year: "2022",
      title: "15,000+ Girls Reached",
      desc: "Partnerships with rural government schools. Set up pad distribution drives and de-stigmatization workshops."
    },
    {
      year: "2023",
      title: "Indian Society Act Registration",
      desc: "Formalized registration under the Indian Society Act, 1860, ensuring administrative transparency and audit readiness."
    },
    {
      year: "2024",
      title: "120,000+ Strong",
      desc: "Scaled aid across multiple districts. Deployed community coordinators to manage emergency resource queries efficiently."
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col space-y-24">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 w-fit mx-auto">
          <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red animate-pulse" />
          <span className="font-poppins font-semibold text-xs tracking-wider uppercase text-brand-red">
            WHO WE ARE
          </span>
        </div>
        <h1 className="font-poppins font-bold text-4xl sm:text-5xl text-white">
          Our Inspiring Story & Purpose
        </h1>
        <p className="text-brand-grayDark text-lg font-dmsans max-w-xl mx-auto leading-relaxed">
          We exist to remove educational barriers for underprivileged girls, replacing shame with safety and dignity.
        </p>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Story Text */}
        <div className="flex flex-col space-y-6 text-left">
          <h2 className="font-poppins font-bold text-3xl text-white">
            How It Started?
          </h2>
          <p className="text-brand-grayDark text-base leading-relaxed font-dmsans">
            The She Can Foundation was established by visionary organizers who shared a common goal: building a world where every young woman has the tools, safety, and confidence to thrive. The idea was sparked by a alarming statistic—that 1 in 5 Indian schoolgirls drop out permanently at puberty due to the lack of clean toilets and basic sanitary items.
          </p>
          <p className="text-brand-grayDark text-base leading-relaxed font-dmsans">
            We recognized that single-phase distribution drives were insufficient. We set out to design a comprehensive platform uniting volunteers, emergency aid pipelines, and interactive digital coordination. Today, as a registered NGO under the Indian Society Act, 1860, we remain dedicated to direct field support and absolute operational transparency.
          </p>
        </div>

        {/* Pillars Cards */}
        <div className="grid grid-cols-1 gap-6">
          {values.map((val) => (
            <div key={val.title} className="glass-panel hover:glass-panel-glow p-6 rounded-2xl transition-all duration-300 flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0">
                {val.icon}
              </div>
              <div className="flex flex-col text-left space-y-1">
                <h3 className="font-poppins font-bold text-lg text-white">{val.title}</h3>
                <p className="text-brand-grayDark text-sm leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col space-y-12">
        <div className="text-center max-w-md mx-auto">
          <h2 className="font-poppins font-bold text-3xl text-white">Our Timeline</h2>
          <p className="text-brand-grayDark text-sm font-dmsans mt-2">
            A journey of growth, trust, and expanding impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {milestones.map((mile, idx) => (
            <div key={mile.year} className="glass-panel p-6 rounded-2xl flex flex-col text-left relative group">
              <span className="font-poppins font-bold text-brand-red text-3xl mb-3">
                {mile.year}
              </span>
              <h3 className="font-poppins font-bold text-lg text-white mb-2">
                {mile.title}
              </h3>
              <p className="text-brand-grayDark text-sm leading-relaxed">
                {mile.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
