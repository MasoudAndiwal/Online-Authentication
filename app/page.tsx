"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const toggleMenu = () => {
    console.log('Toggle menu - current state:', mobileMenuOpen);
    setMobileMenuOpen(prev => !prev);
    console.log('Toggle menu - new state will be:', !mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/60 sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline">
                <span className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                  University
                </span>
                <span className="text-base sm:text-xl font-bold text-blue-600 sm:ml-1 leading-tight">
                  AttendanceHub
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
              >
                Features
              </a>
              <a
                href="#roles"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
              >
                User Roles
              </a>
              <a
                href="#benefits"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
              >
                Benefits
              </a>
              <a
                href="/login"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
              >
                Login
              </a>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                Contact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-700" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-1 border-t border-slate-200 pt-4 bg-slate-50/50 -mx-4 px-4 rounded-b-lg">
              <a
                href="#features"
                className="block text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors py-3 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#roles"
                className="block text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors py-3 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                User Roles
              </a>
              <a
                href="#benefits"
                className="block text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors py-3 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="/login"
                className="block text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors py-3 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
              <div className="pt-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Office
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-emerald-50/30"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-7xl text-center relative">
          <Badge
            variant="secondary"
            className="mb-4 sm:mb-6 bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium inline-flex items-center"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Modern University Management System
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight px-2">
            <span className="text-slate-900">Smart Attendance</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent">
              Tracking System
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            Streamline your university&#39;s attendance management with our
            comprehensive digital platform.{" "}
            <span className="font-semibold text-slate-700">
              Built for administrators, teachers, and students.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Contact Administration
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 border-2 border-slate-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              View Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-col items-center">
            <p className="text-sm text-slate-500 mb-4">
              Trusted by universities for reliable attendance management
            </p>
            <div className="flex items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Mobile Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Core Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div id="roles"></div>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Everything you need for
              <span className="text-blue-600 block">attendance management</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed for modern universities with
              role-based access and intelligent automation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Office Management */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-purple-900 mb-2">
                  Office Management
                </CardTitle>
                <CardDescription className="text-purple-700/80 text-base">
                  Complete administrative control with advanced analytics and
                  reporting
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      User management & role assignment
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Schedule creation & management
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Comprehensive reporting & analytics
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Data export & system configuration
                    </span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg text-lg py-3">
                  Office Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Interface */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-orange-900 mb-2">
                  Teacher Interface
                </CardTitle>
                <CardDescription className="text-orange-700/80 text-base">
                  Streamlined attendance marking with intelligent bulk
                  operations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      One-click attendance marking
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Class roster & student alerts
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Progress tracking & reports
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Mobile-optimized interface
                    </span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg text-lg py-3">
                  Teacher Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Student Portal */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-emerald-900 mb-2">
                  Student Portal
                </CardTitle>
                <CardDescription className="text-emerald-700/80 text-base">
                  Personal attendance insights with motivational progress
                  tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Real-time attendance records
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Percentage & goal tracking
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Weekly & monthly summaries
                    </span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-3"></div>
                    <span className="font-medium">
                      Status alerts & notifications
                    </span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg text-lg py-3">
                  Student Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Interactive Demo Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-50 text-blue-700 border-blue-200"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Live Demo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              See the system
              <span className="text-blue-600 block">in action</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience our intuitive interface designed for real-world
              university environments
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-3xl font-bold mb-6 text-slate-900">
                Smart Attendance Marking
              </h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our color-coded system makes attendance tracking intuitive and
                efficient. Teachers can mark attendance with a single click
                using our status system.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        AH
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Ahmad Hassan
                      </p>
                      <p className="text-sm text-slate-500">
                        Student ID: CS-2024-001
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md"
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      Absent
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                        SK
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">Sara Khan</p>
                      <p className="text-sm text-slate-500">
                        Student ID: CS-2024-002
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                    >
                      Sick
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      Leave
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    💡 Pro Tip: Use bulk actions to mark entire classes quickly,
                    or set full-day status for sick/leave students
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold mb-6 text-slate-900">
                Real-time Analytics
              </h3>
              <Card className="shadow-2xl border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                    Class Attendance Overview
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Computer Science - Fall 2024
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Overall Attendance Rate
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                        89.2%
                      </Badge>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: "89.2%" }}
                      ></div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <p className="text-3xl font-bold text-green-600">
                            187
                          </p>
                        </div>
                        <p className="text-sm font-medium text-green-700">
                          Present
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <p className="text-3xl font-bold text-red-600">23</p>
                        </div>
                        <p className="text-sm font-medium text-red-700">
                          Absent
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <p className="text-3xl font-bold text-yellow-600">
                            8
                          </p>
                        </div>
                        <p className="text-sm font-medium text-yellow-700">
                          Sick
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center justify-center mb-2">
                          <p className="text-3xl font-bold text-blue-600">5</p>
                        </div>
                        <p className="text-sm font-medium text-blue-700">
                          Leave
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="mb-4 bg-slate-100 text-slate-700 border-slate-200"
            >
              <Shield className="w-4 h-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Built for modern
              <span className="text-blue-600 block">universities</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Advanced technology meets educational excellence with features
              designed for reliability, efficiency, and ease of use
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                Secure & Reliable
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Enterprise-grade security with encrypted data transmission,
                automated backups, and comprehensive audit logging for complete
                peace of mind.
              </p>
              <div className="mt-6 flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  99.9% Uptime
                </Badge>
              </div>
            </div>

            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                Time Saving
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Reduce administrative overhead by 75% with automated processes,
                bulk operations, and intelligent workflows that handle routine
                tasks.
              </p>
              <div className="mt-6 flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  75% Time Saved
                </Badge>
              </div>
            </div>

            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                Mobile Ready
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Responsive design that works flawlessly on all devices.
                Touch-optimized interface with swipe gestures for efficient
                mobile attendance marking.
              </p>
              <div className="mt-6 flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  All Devices
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Benefits Grid */}
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Smart Analytics</h4>
              <p className="text-sm text-slate-600">
                Real-time insights and predictive analytics
              </p>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">
                Role-Based Access
              </h4>
              <p className="text-sm text-slate-600">
                Secure permissions for each user type
              </p>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">
                Flexible Scheduling
              </h4>
              <p className="text-sm text-slate-600">
                Customizable academic calendars
              </p>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">
                Performance Tracking
              </h4>
              <p className="text-sm text-slate-600">
                Monitor trends and identify patterns
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">University</span>
                  <span className="text-2xl font-bold text-blue-400 ml-1">
                    AttendanceHub
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Modern attendance management system designed for universities.
                Streamline your academic processes with intelligent automation
                and real-time insights.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Quick Links
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#features"
                    className="text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#roles"
                    className="text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    User Roles
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Benefits
                  </a>
                </li>
                <li>
                  <a
                    href="/office/login"
                    className="text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Office Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-slate-300">
                  <Mail className="h-4 w-4 mr-3 text-blue-400" />
                  admin@university.edu
                </li>
                <li className="flex items-center text-slate-300">
                  <Phone className="h-4 w-4 mr-3 text-blue-400" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-slate-300">
                  <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                  Administration Building
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-slate-700 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 mb-4 md:mb-0">
              © 2025 University AttendanceHub. Built with modern technology for
              educational excellence.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-slate-400 text-sm">Powered by</span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-slate-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-300">N</span>
                </div>
                <span className="text-slate-300 text-sm font-medium">
                  Next.js
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
