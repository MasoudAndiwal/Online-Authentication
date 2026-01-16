"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  Shield,
  Clock,
  Smartphone,
  Calendar,
  TrendingUp,
  Star,
  Mail,
  Menu,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Globe,
  Lock,
  Fingerprint,
  Cpu,
  Database,
  Cloud,
  LineChart,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// Import custom effect components
import ClickSpark from "@/components/ClickSpark";
import SplitText from "@/components/SplitText";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollFloat from "@/components/ScrollFloat";
import TextType from "@/components/TextType";
import { FloatingElement } from "@/components/ui/3d-elements";
import CountUp from "@/components/CountUp";

// Animated gradient mesh background (without animated circles)
const GradientMesh = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent" />
  </div>
);

// 3D Floating Icon Component
const Icon3D = ({
  icon: Icon,
  gradient,
  size = "lg",
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
}) => {
  const sizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
    xl: "h-24 w-24",
  } as const;
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        scale: 1.1,
        rotateY: 15,
        rotateX: 10,
        z: 50,
      }}
      className="relative group cursor-pointer"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <div
        className={`${sizes[size]} ${gradient} rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
        style={{ transform: "translateZ(20px)" }}
      >
        <Icon className={`${iconSizes[size]} text-white drop-shadow-lg relative z-10`} />
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div
          className="absolute inset-0 bg-linear-to-tr from-white/30 to-transparent"
          initial={{ x: "-100%", y: "-100%" }}
          whileHover={{ x: "100%", y: "100%" }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <div
        className="absolute inset-0 rounded-3xl bg-slate-900/20 blur-xl -z-10"
        style={{ transform: "translateZ(-10px) translateY(10px)" }}
      />
    </motion.div>
  );
};

// Animated Stats Counter Card
const StatCard3D = ({
  value,
  suffix = "+",
  label,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay?: number;
}) => (
  <ScrollFloat direction="up" distance={60} delay={delay}>
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-2xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div
            className={["h-12 w-12 sm:h-14 sm:w-14 shrink-0", gradient, "rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"].join(" ")}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-baseline justify-center sm:justify-start">
              <CountUp to={value} duration={2.5} />
              <span className="text-xl sm:text-2xl ml-0.5">{suffix}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">{label}</p>
          </div>
        </div>
        <motion.div
          className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      </div>
    </motion.div>
  </ScrollFloat>
);

// Feature Card with 3D Hover Effect
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features,
  gradient,
  buttonText,
  href,
  delay = 0,
  accentColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  buttonText: string;
  href: string;
  delay?: number;
  accentColor: string;
}) => (
  <ScrollFloat direction="up" distance={80} delay={delay}>
    <motion.div
      whileHover={{ y: -12 }}
      className="group relative h-full"
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/60 to-white/40 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-white/80 backdrop-blur-2xl rounded-4xl p-8 shadow-xl overflow-hidden h-full flex flex-col">
        {/* Decorative Elements */}
        <div className={`absolute top-0 right-0 w-40 h-40 ${gradient} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
        <div className={`absolute bottom-0 left-0 w-32 h-32 ${gradient} opacity-5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2`} />

        <FloatingElement amplitude={6} speed={3}>
          <div className={`h-16 w-16 ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </FloatingElement>

        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>

        <ul className="space-y-3 mb-8 grow">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: delay + index * 0.1 }}
              className="flex items-center text-slate-700"
            >
              <div className={`h-5 w-5 rounded-full ${accentColor} flex items-center justify-center mr-3 shrink-0`}>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Link href={href} className="mt-auto">
          <Button className={`w-full ${gradient} hover:opacity-90 shadow-lg text-lg py-6 group/btn relative overflow-hidden`}>
            <span className="relative z-10 flex items-center justify-center">
              {buttonText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </Button>
        </Link>
      </div>
    </motion.div>
  </ScrollFloat>
);

// Benefit Card Component
const BenefitCard = ({
  icon: Icon,
  title,
  description,
  badge,
  gradient,
  badgeColor,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  badgeColor: string;
  delay?: number;
}) => (
  <ScrollFloat direction="up" distance={60} delay={delay}>
    <motion.div
      whileHover={{ y: -8 }}
      className="text-center group"
    >
      <div className="flex justify-center mb-6">
        <Icon3D icon={Icon} gradient={`bg-linear-to-br ${gradient}`} size="lg" />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">{description}</p>
      <Badge className={`${badgeColor} text-sm px-4 py-1.5`}>{badge}</Badge>
    </motion.div>
  </ScrollFloat>
);

// Mini Feature Card
const MiniFeatureCard = ({
  icon: Icon,
  title,
  desc,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
  delay?: number;
}) => (
  <ScrollFloat direction="up" distance={40} delay={delay}>
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="text-center p-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-600">{desc}</p>
    </motion.div>
  </ScrollFloat>
);

// Animated Grid Pattern
const GridPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);

  const typingTexts = [
    "Smart Attendance",
    "Real-time Analytics",
    "Seamless Management",
    "Digital Excellence",
  ];

  return (
    <ClickSpark sparkColor="#3b82f6" sparkCount={12} sparkRadius={30} duration={600}>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
        {/* Animated Background */}
        <GradientMesh />
        <GridPattern />

        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled || mobileMenuOpen
              ? "bg-white/95 backdrop-blur-2xl shadow-lg shadow-slate-200/50"
              : "bg-transparent"
          }`}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="h-10 w-10 sm:h-12 sm:w-12 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </motion.div>
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                  <span className="text-lg sm:text-xl font-bold text-slate-900">University</span>
                  <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:ml-1">
                    AttendanceHub
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {["Features", "Roles", "Benefits"].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors relative group"
                    whileHover={{ y: -2 }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login">
                    <Button className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-500/30">
                      <Lock className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                </motion.div>
              </nav>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden mt-4 pb-4 space-y-2 overflow-hidden"
                >
                  {["Features", "Roles", "Benefits"].map((item, index) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="block text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </motion.a>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2"
                  >
                    <Link href="/login">
                      <Button className="w-full bg-linear-to-r from-blue-600 to-indigo-700 shadow-lg">
                        <Lock className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16"
        >
          <div className="container mx-auto max-w-7xl text-center relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-8 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 px-5 py-2.5 text-sm font-medium backdrop-blur-sm shadow-sm">
                <Star className="w-4 h-4 mr-2 fill-blue-500 text-blue-500" />
                Next-Generation University Management Platform
              </Badge>
            </motion.div>

            {/* Main Heading with TypeWriter */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-4">
                  <TextType
                    texts={typingTexts}
                    className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseDuration={2500}
                    cursorChar="_"
                  />
                </h1>
              </motion.div>
              <SplitText
                text="Tracking System"
                tag="h1"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900"
                delay={60}
                duration={0.8}
                ease="power4.out"
                splitType="chars"
                from={{ opacity: 0, y: 80, rotateX: -90 }}
                to={{ opacity: 1, y: 0, rotateX: 0 }}
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed px-4"
            >
              Transform your university&apos;s attendance management with our
              intelligent digital platform.{" "}
              <span className="font-semibold text-slate-700">
                Designed for administrators, teachers, and students.
              </span>
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
            >
              {[
                { icon: Shield, label: "Enterprise Security", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Clock, label: "Real-time Sync", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Smartphone, label: "Mobile Ready", color: "text-purple-600", bg: "bg-purple-50" },
                { icon: Cloud, label: "Cloud Based", color: "text-cyan-600", bg: "bg-cyan-50" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className={`flex items-center gap-2 px-4 py-2.5 ${item.bg} backdrop-blur-sm rounded-full shadow-sm`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </motion.section>


        {/* Stats Section */}
        <section id="stats" className="py-20 px-4 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard3D
                value={500}
                label="Active Students"
                icon={Users}
                gradient="bg-linear-to-br from-blue-500 to-blue-600"
                delay={0}
              />
              <StatCard3D
                value={50}
                label="Expert Teachers"
                icon={GraduationCap}
                gradient="bg-linear-to-br from-emerald-500 to-emerald-600"
                delay={0.1}
              />
              <StatCard3D
                value={30}
                label="Active Classes"
                icon={BookOpen}
                gradient="bg-linear-to-br from-purple-500 to-purple-600"
                delay={0.2}
              />
              <StatCard3D
                value={99}
                suffix="%"
                label="System Uptime"
                icon={Zap}
                gradient="bg-linear-to-br from-orange-500 to-orange-600"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <ScrollFloat direction="up" distance={40}>
                <Badge className="mb-6 bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-700 px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Powerful Features
                </Badge>
              </ScrollFloat>

              <ScrollReveal
                enableBlur={true}
                baseOpacity={0.1}
                blurStrength={4}
                containerClassName="mb-6"
                textClassName="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900"
              >
                Everything you need for modern attendance management
              </ScrollReveal>

              <ScrollFloat direction="up" distance={30} delay={0.2}>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Comprehensive tools designed for universities with role-based access and intelligent automation
                </p>
              </ScrollFloat>
            </div>

            {/* Role Cards */}
            <div id="roles" className="grid lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Building2}
                title="Office Management"
                description="Complete administrative control with advanced analytics and reporting capabilities"
                features={[
                  "User management & role assignment",
                  "Schedule creation & management",
                  "Comprehensive reporting & analytics",
                  "Data export & system configuration",
                ]}
                gradient="bg-linear-to-r from-purple-600 to-purple-700"
                accentColor="bg-purple-500"
                buttonText="Office Dashboard"
                href="/login"
                delay={0}
              />
              <FeatureCard
                icon={Users}
                title="Teacher Interface"
                description="Streamlined attendance marking with intelligent bulk operations"
                features={[
                  "One-click attendance marking",
                  "Class roster & student alerts",
                  "Progress tracking & reports",
                  "Mobile-optimized interface",
                ]}
                gradient="bg-linear-to-r from-orange-500 to-orange-600"
                accentColor="bg-orange-500"
                buttonText="Teacher Portal"
                href="/login"
                delay={0.15}
              />
              <FeatureCard
                icon={BookOpen}
                title="Student Portal"
                description="Personal attendance insights with motivational progress tracking"
                features={[
                  "Real-time attendance records",
                  "Percentage & goal tracking",
                  "Weekly & monthly summaries",
                  "Status alerts & notifications",
                ]}
                gradient="bg-linear-to-r from-emerald-500 to-emerald-600"
                accentColor="bg-emerald-500"
                buttonText="Student Portal"
                href="/login"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-24 px-4 relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <ScrollFloat direction="up" distance={40}>
                <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Live Demo
                </Badge>
              </ScrollFloat>

              <SplitText
                text="See the system in action"
                tag="h2"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
                delay={60}
                duration={0.6}
                splitType="words"
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
              />

              <ScrollFloat direction="up" distance={30} delay={0.2}>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Experience our intuitive interface designed for real-world university environments
                </p>
              </ScrollFloat>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Attendance Demo */}
              <ScrollFloat direction="left" distance={60}>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-blue-600" />
                    Smart Attendance Marking
                  </h3>
                  <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-base">
                    Our color-coded system makes attendance tracking intuitive and efficient.
                    Teachers can mark attendance with a single click.
                  </p>

                  <div className="space-y-4">
                    {[
                      { name: "Ahmad Hassan", id: "CS-2024-001", initials: "AH", color: "bg-blue-500" },
                      { name: "Sara Khan", id: "CS-2024-002", initials: "SK", color: "bg-emerald-500" },
                    ].map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg gap-4"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 ${student.color} rounded-full flex items-center justify-center text-white font-semibold shadow-lg text-sm sm:text-base`}>
                            {student.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">{student.name}</p>
                            <p className="text-xs sm:text-sm text-slate-500">ID: {student.id}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-lg transition-colors text-sm"
                          >
                            Present
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-lg transition-colors text-sm"
                          >
                            Absent
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-blue-100 rounded-xl"
                  >
                    <p className="text-sm text-blue-700 font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Pro Tip: Use bulk actions to mark entire classes quickly
                    </p>
                  </motion.div>
                </div>
              </ScrollFloat>

              {/* Right: Analytics Demo */}
              <ScrollFloat direction="right" distance={60}>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <LineChart className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-emerald-600" />
                    Real-time Analytics
                  </h3>
                  <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center">
                          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                          Class Attendance Overview
                        </h4>
                        <p className="text-slate-500 text-xs sm:text-sm">Computer Science - Fall 2024</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 text-base sm:text-lg px-3 py-1">
                        89.2%
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "89.2%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-linear-to-r from-emerald-500 to-emerald-400 h-3 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: "Present", value: 187, color: "bg-emerald-100 text-emerald-700" },
                        { label: "Absent", value: 23, color: "bg-red-100 text-red-700" },
                        { label: "Sick", value: 8, color: "bg-yellow-100 text-yellow-700" },
                        { label: "Leave", value: 5, color: "bg-blue-100 text-blue-700" },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className={`text-center p-3 sm:p-4 rounded-xl ${stat.color}`}
                        >
                          <p className="text-2xl sm:text-3xl font-bold">
                            <CountUp to={stat.value} duration={1.5} />
                          </p>
                          <p className="text-xs sm:text-sm font-medium opacity-80">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollFloat>
            </div>
          </div>
        </section>


        {/* Benefits Section */}
        <section id="benefits" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <ScrollFloat direction="up" distance={40}>
                <Badge className="mb-6 bg-slate-100 text-slate-700 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Why Choose Us
                </Badge>
              </ScrollFloat>

              <ScrollReveal
                enableBlur={true}
                baseOpacity={0.1}
                blurStrength={4}
                containerClassName="mb-6"
                textClassName="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900"
              >
                Built for modern universities
              </ScrollReveal>

              <ScrollFloat direction="up" distance={30} delay={0.2}>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Advanced technology meets educational excellence with features designed for reliability and ease of use
                </p>
              </ScrollFloat>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-12 mb-20">
              <BenefitCard
                icon={Shield}
                title="Secure & Reliable"
                description="Enterprise-grade security with encrypted data transmission, automated backups, and comprehensive audit logging."
                badge="99.9% Uptime"
                gradient="from-blue-500 to-blue-600"
                badgeColor="bg-blue-50 text-blue-700"
                delay={0}
              />
              <BenefitCard
                icon={Clock}
                title="Time Saving"
                description="Reduce administrative overhead by 75% with automated processes, bulk operations, and intelligent workflows."
                badge="75% Time Saved"
                gradient="from-emerald-500 to-emerald-600"
                badgeColor="bg-emerald-50 text-emerald-700"
                delay={0.15}
              />
              <BenefitCard
                icon={Smartphone}
                title="Mobile Ready"
                description="Responsive design that works flawlessly on all devices. Touch-optimized interface with swipe gestures."
                badge="All Devices"
                gradient="from-purple-500 to-purple-600"
                badgeColor="bg-purple-50 text-purple-700"
                delay={0.3}
              />
            </div>

            {/* Additional Benefits */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MiniFeatureCard
                icon={BarChart3}
                title="Smart Analytics"
                desc="Real-time insights and predictive analytics"
                color="bg-blue-100 text-blue-600"
                delay={0}
              />
              <MiniFeatureCard
                icon={Fingerprint}
                title="Role-Based Access"
                desc="Secure permissions for each user type"
                color="bg-emerald-100 text-emerald-600"
                delay={0.1}
              />
              <MiniFeatureCard
                icon={Calendar}
                title="Flexible Scheduling"
                desc="Customizable academic calendars"
                color="bg-orange-100 text-orange-600"
                delay={0.2}
              />
              <MiniFeatureCard
                icon={TrendingUp}
                title="Performance Tracking"
                desc="Monitor trends and identify patterns"
                color="bg-purple-100 text-purple-600"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-20 px-4 relative bg-linear-to-b from-slate-50 to-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <ScrollFloat direction="up" distance={40}>
                <Badge className="mb-6 bg-indigo-50 text-indigo-700 px-4 py-2">
                  <Cpu className="w-4 h-4 mr-2" />
                  Technology Stack
                </Badge>
              </ScrollFloat>

              <ScrollFloat direction="up" distance={30} delay={0.1}>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Powered by Modern Technology
                </h2>
              </ScrollFloat>

              <ScrollFloat direction="up" distance={30} delay={0.2}>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Built with cutting-edge technologies for performance, security, and scalability
                </p>
              </ScrollFloat>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Database, label: "Supabase", desc: "PostgreSQL Database", color: "from-emerald-500 to-emerald-600" },
                { icon: Globe, label: "Next.js 15", desc: "React Framework", color: "from-slate-700 to-slate-800" },
                { icon: Cloud, label: "Vercel", desc: "Edge Deployment", color: "from-blue-500 to-blue-600" },
                { icon: Lock, label: "Auth", desc: "Secure Sessions", color: "from-purple-500 to-purple-600" },
              ].map((tech, index) => (
                <ScrollFloat key={tech.label} direction="up" distance={40} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="text-center p-6 bg-white rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`h-14 w-14 bg-linear-to-br ${tech.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <tech.icon className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{tech.label}</h4>
                    <p className="text-sm text-slate-500">{tech.desc}</p>
                  </motion.div>
                </ScrollFloat>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-linear-to-br from-slate-50 via-white to-blue-50/30 py-12 sm:py-16 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
              {/* Brand Section */}
              <div className="sm:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900">University</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">AttendanceHub</span>
                  </div>
                </motion.div>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md mb-6">
                  Modern attendance management system designed for universities.
                  Streamline your academic processes with intelligent automation.
                </p>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Clock, label: "Real-time" },
                    { icon: Smartphone, label: "Mobile" },
                  ].map((item) => (
                    <Badge
                      key={item.label}
                      className="bg-slate-100 text-slate-700 text-xs sm:text-sm"
                    >
                      <item.icon className="w-3 h-3 mr-1" />
                      {item.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-slate-900">Quick Links</h3>
                <ul className="space-y-4">
                  {[
                    { label: "Features", href: "#features" },
                    { label: "User Roles", href: "#roles" },
                    { label: "Benefits", href: "#benefits" },
                    { label: "Login", href: "/login" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-slate-600 hover:text-blue-600 transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-slate-900">Contact</h3>
                <ul className="space-y-4">
                  <li className="flex items-center text-slate-600">
                    <Mail className="w-5 h-5 mr-3 text-blue-600" />
                    support@attendancehub.edu
                  </li>
                  <li className="flex items-center text-slate-600">
                    <Globe className="w-5 h-5 mr-3 text-blue-600" />
                    www.attendancehub.edu
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 mt-8 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-sm">
                  © 2024 University AttendanceHub. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ClickSpark>
  );
}
