'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Route,
  Package,
  Users,
  Camera,
  RefreshCw,
  FileText,
  ChevronRight,
  Check,
  Play,
  ArrowRight,
  Zap,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react'

const features = [
  {
    icon: Route,
    title: 'Smart Route Optimization',
    description: 'AI-powered routing minimizes drive time. Crews spend more time working, less time in the truck.',
    color: 'bg-red-500'
  },
  {
    icon: Package,
    title: 'Inventory Tracking',
    description: 'QR code labels keep every string of lights organized by customer. No more lost equipment.',
    color: 'bg-green-500'
  },
  {
    icon: Users,
    title: 'Crew Management',
    description: 'Assign crews to routes, track progress in real-time, and see who\'s crushing it.',
    color: 'bg-red-500'
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description: 'Before/after photos prove the job is done right. Automatic completion reports sent to customers.',
    color: 'bg-green-500'
  },
  {
    icon: RefreshCw,
    title: 'Jobber Sync',
    description: 'Two-way sync with Jobber. Customer data, schedules, and payment status always up to date.',
    color: 'bg-red-500'
  },
  {
    icon: FileText,
    title: 'Customer Reports',
    description: 'Professional PDF reports auto-generated and emailed when the job is complete.',
    color: 'bg-green-500'
  }
]

const stats = [
  { value: '30%', label: 'Faster Takedowns', icon: Zap },
  { value: '12+', label: 'Hours Saved Weekly', icon: Clock },
  { value: '95%', label: 'Less Lost Inventory', icon: TrendingUp },
  { value: '100%', label: 'Customer Visibility', icon: Shield }
]

const faqs = [
  {
    q: 'How does the Jobber integration work?',
    a: 'Connect your Jobber account with one click. We sync your clients, jobs, and schedules automatically. Status updates flow back to Jobber in real-time.'
  },
  {
    q: 'Do my crews need special training?',
    a: 'The app is designed for field use. Big buttons, simple workflows. Most crews are productive within 10 minutes.'
  },
  {
    q: 'What about areas with poor cell service?',
    a: 'The app works offline. Data syncs automatically when connection is restored. Your crews are never stuck.'
  },
  {
    q: 'Can I try it before the takedown season?',
    a: 'Absolutely. Sign up now and import test data from Jobber. Be ready when January hits.'
  }
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-festive flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-zinc-900">TakedownPro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 transition">Features</a>
              <a href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 transition">Pricing</a>
              <a href="#faq" className="text-sm text-zinc-600 hover:text-zinc-900 transition">FAQ</a>
            </div>
            <Link
              href="/api/auth/jobber"
              className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition flex items-center gap-2"
            >
              Connect Jobber
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Built for Christmas Light Pros
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
                Takedown Season,{' '}
                <span className="text-gradient">Optimized</span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Route optimization, inventory tracking, and crew management—all synced with Jobber.
                Turn chaos into clockwork.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/api/auth/jobber"
                  className="gradient-festive text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 glow-red"
                >
                  Connect with Jobber
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <button className="bg-white text-zinc-900 px-8 py-4 rounded-full text-lg font-semibold border border-zinc-200 hover:border-zinc-300 transition flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Free 14-day trial
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
              </div>
            </div>

            {/* Right: Video/Image placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200">
                {/* Video placeholder - will be replaced with HeyGen video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto cursor-pointer hover:scale-105 transition">
                      <Play className="w-8 h-8 text-red-500 ml-1" />
                    </div>
                    <p className="text-zinc-600 font-medium">Watch Brandon explain TakedownPro</p>
                  </div>
                </div>
                {/* Decorative lights */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-slow" />
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-zinc-100 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900">30%</p>
                    <p className="text-sm text-zinc-500">Faster takedowns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-zinc-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Everything You Need for Takedown Season
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Purpose-built tools that integrate with your existing Jobber workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-lg transition group"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Connect Jobber', desc: 'One-click OAuth. Your clients, jobs, and schedules sync automatically.' },
              { step: '2', title: 'Build Routes', desc: 'Drag and drop jobs onto crews. Our AI optimizes the order.' },
              { step: '3', title: 'Track & Complete', desc: 'Crews update status, take photos, and mark inventory. You see it all in real-time.' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 gradient-festive rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-600">
              Pay only during takedown season. Cancel anytime.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl border-2 border-zinc-900 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-zinc-900 text-white px-4 py-1 text-sm font-medium rounded-bl-xl">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Pro Season Pass</h3>
              <p className="text-zinc-600 mb-6">Everything you need for a successful takedown season</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold text-zinc-900">$99</span>
                <span className="text-zinc-500">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited jobs & crews',
                  'Jobber integration',
                  'Route optimization',
                  'Inventory tracking with QR codes',
                  'Photo documentation',
                  'Customer completion reports',
                  'Real-time crew tracking',
                  'Priority support'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/api/auth/jobber"
                className="block w-full bg-zinc-900 text-white py-4 rounded-full text-center font-semibold hover:bg-zinc-800 transition"
              >
                Start Free Trial
              </Link>
              <p className="text-center text-sm text-zinc-500 mt-4">
                14-day free trial • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-zinc-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-50 transition"
                >
                  <span className="font-medium text-zinc-900">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-zinc-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Ready to Crush Takedown Season?
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            Join hundreds of Christmas light pros who are already saving time and money.
          </p>
          <Link
            href="/api/auth/jobber"
            className="inline-flex items-center gap-2 gradient-festive text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition glow-red"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-festive flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">TakedownPro</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Support</a>
            </div>
            <p className="text-sm text-zinc-500">
              © 2024 TakedownPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
