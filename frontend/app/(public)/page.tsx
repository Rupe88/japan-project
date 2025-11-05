'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GamingButton } from '@/components/ui/gaming-button';
import { useRouter } from 'next/navigation';
import { useSound } from '@/hooks/use-sound';
import { useAuth } from '@/lib/hooks/use-auth';
import { Platform, PlatformType, UserType } from '@/lib/types/platform';

export default function LandingPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { user, isLoading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ✅ FIX: Consolidated all hooks at the top, removed duplicates
  const particles = useMemo(
    () =>
      [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ✅ FIX: Single redirect effect, no duplicates
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/select-platform');
    }
  }, [user, isLoading, router]);

  // ✅ FIX: Single loading state check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // ✅ FIX: Single user redirect check
  if (user) {
    return null;
  }

  const platforms: Platform[] = [
    {
      id: PlatformType.HR,
      name: 'HR Platform',
      description: 'Talent acquisition, recruitment, and career development',
      icon: '👥',
      color: 'cyan',
      gradient: 'from-cyan-400 to-blue-600',
      userTypes: [UserType.INDIVIDUAL, UserType.TRADING, UserType.SERVICE],
      features: [
        'Job Postings',
        'Resume Database',
        'Skill Matching',
        'Training Programs',
      ],
    },
    {
      id: PlatformType.TENDER,
      name: 'Tender System',
      description: 'Government and private tendering with secure bidding',
      icon: '📋',
      color: 'purple',
      gradient: 'from-purple-400 to-indigo-600',
      userTypes: [UserType.INDUSTRIAL, UserType.PRODUCTION],
      features: [
        'Tender Search',
        'Bid Management',
        'Document Upload',
        'Winner Announcement',
      ],
    },
    {
      id: PlatformType.MARKETPLACE,
      name: 'Product Marketplace',
      description: 'Buy and sell products with verified merchants',
      icon: '🛍️',
      color: 'pink',
      gradient: 'from-pink-400 to-rose-600',
      userTypes: [UserType.TRADING, UserType.SERVICE, UserType.INDIVIDUAL],
      features: [
        'Product Listings',
        'Secure Payment',
        'Seller Dashboard',
        'Reviews & Ratings',
      ],
    },
    {
      id: PlatformType.ECOMMERCE,
      name: 'Service Marketplace',
      description: 'Complete online service management and client booking',
      icon: '🛒',
      color: 'orange',
      gradient: 'from-orange-400 to-amber-600',
      userTypes: [UserType.SERVICE, UserType.PRODUCTION],
      features: [
        'Service Listings',
        'Client Management',
        'Payment Gateway',
        'Order Tracking',
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />

      <nav className="relative z-50 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
            <span className="text-2xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            TRADING PLATFORM
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <GamingButton
            variant="outline"
            size="sm"
            onClick={() => {
              playSound('click');
              router.push('/login');
            }}
          >
            Login
          </GamingButton>
          <GamingButton
            variant="primary"
            size="sm"
            onClick={() => {
              playSound('click');
              router.push('/register');
            }}
          >
            Register
          </GamingButton>
        </motion.div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="inline-block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                MULTI-PLATFORM
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                ECOSYSTEM
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
            >
              Choose your platform and start trading, hiring, bidding, or
              selling today
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {platforms.map((platform, index) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                index={index}
                onSelect={() => {
                  playSound('click');
                  router.push(`/platforms/${platform.id}`);
                }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-400 mb-6">Don't have an account yet?</p>
            <GamingButton
              variant="primary"
              size="xl"
              glowColor="pink"
              onClick={() => {
                playSound('click');
                router.push('/register');
              }}
            >
              Join Now
            </GamingButton>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: ['0vh', '100vh'] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-cyan-400 opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-pink-400 opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-purple-400 opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-cyan-400 opacity-30" />
    </div>
  );
}

const PlatformCard: React.FC<{
  platform: {
    id: string;
    name: string;
    description: string;
    icon: string;
    gradient: string;
    features: string[];
    color: 'cyan' | 'purple' | 'pink' | 'orange';
  };
  index: number;
  onSelect: () => void;
}> = ({ platform, index, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const borderColorMap = {
    cyan: 'hover:border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)]',
    purple: 'hover:border-purple-400 shadow-[0_0_30px_rgba(128,0,255,0.3)]',
    pink: 'hover:border-pink-400 shadow-[0_0_30px_rgba(255,0,128,0.3)]',
    orange: 'hover:border-orange-400 shadow-[0_0_30px_rgba(255,165,0,0.3)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <div
        className={`
          relative p-6 rounded-xl
          bg-gray-900/40 backdrop-blur-md
          border-2 border-gray-700
          transition-all duration-300
          ${borderColorMap[platform.color]}
          group
        `}
      >
        <motion.div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${platform.gradient} opacity-0 -z-10`}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          animate={{ scale: isHovered ? 1.2 : 1, rotateZ: isHovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-5xl mb-4"
        >
          {platform.icon}
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">
          {platform.name}
        </h3>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {platform.description}
        </p>

        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="mb-4 space-y-1 overflow-hidden"
        >
          {platform.features.map((feature, i) => (
            <li
              key={i}
              className="text-xs text-gray-400 flex items-center gap-2"
            >
              <span
                className={`w-1 h-1 rounded-full bg-gradient-to-r ${platform.gradient}`}
              />
              {feature}
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-semibold text-cyan-400 group-hover:text-pink-400 transition-colors">
            Explore Platform →
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
