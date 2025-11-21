
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, BarChart3, Users, Lock, Zap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Risk Assessment",
      description: "Advanced risk profiling and assessment tools for comprehensive client evaluation.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Client Management",
      description: "Efficient client data management with CSV upload capabilities and organized records.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Reports & Analytics",
      description: "Comprehensive reporting tools with Excel export functionality for detailed analysis.",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Welcome - CDD System</title>
        <meta name="description" content="Customer Due Diligence & Risk Assessment System" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Navigation Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Indian Ocean General Assurance Ltd</h1>
                  <p className="text-blue-200 text-sm">CDD System</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4"
              >
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition duration-300 font-medium flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                {/* <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition duration-300 font-medium flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link> */}
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Customer Due Diligence
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
                Comprehensive risk assessment and client management system designed to streamline your insurance processes and enhance decision-making.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-[#0F2027] to-[#2C5364] text-white font-semibold hover:shadow-xl transition duration-300 transform hover:-translate-y-1 gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Dashboard
                </Link>
                {/* <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition duration-300 transform hover:-translate-y-1 gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Request an Account
                </Link> */}
              </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid md:grid-cols-3 gap-8 mb-20"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur border border-white/20 p-8 rounded-xl hover:bg-white/20 transition duration-300"
                >
                  <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-lg w-14 h-14 flex items-center justify-center mb-4 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-200">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur border border-white/20 rounded-xl p-8 mb-20"
            >
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">1000+</p>
                  <p className="text-blue-200 mt-2">Active Users</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">50K+</p>
                  <p className="text-blue-200 mt-2">Assessments</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">99.9%</p>
                  <p className="text-blue-200 mt-2">Uptime</p>
                </div>
              </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 mb-20"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Why Choose Us?
                </h3>
                {[
                  "Fast and secure account verification",
                  "Comprehensive risk assessment tools",
                  "Real-time compliance monitoring",
                  "Detailed analytics and reporting",
                  "Dedicated admin support",
                  "Enterprise-grade security"
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.05 }}
                    className="flex items-center gap-3 text-blue-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    {benefit}
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/20 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Getting Started</h3>
                <ol className="space-y-4">
                  {[
                    { step: 1, text: "Create account via registration form", time: "2 min" },
                    { step: 2, text: "Admin reviews your application", time: "24 hrs" },
                    { step: 3, text: "Receive temporary password via email", time: "instant" },
                    { step: 4, text: "Login and change your password", time: "1 min" },
                    { step: 5, text: "Start using the system", time: "Ready!" }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + idx * 0.05 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-white">{item.text}</p>
                        <p className="text-sm text-blue-300">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                <div className="space-y-2 text-blue-300">
                  <p>📍 20, Volcy Pougnet Street, Port Louis, Mauritius</p>
                  <p>📞 +230 208 9000</p>
                  <p>📧 info@iogaltd.com</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Hours</h3>
                <div className="space-y-2 text-blue-300">
                  <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p>Saturday: 9:00 AM - 12:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/login" className="text-blue-300 hover:text-blue-100 transition">Login</Link>
                  <br />
                  {/* <Link to="/register" className="text-blue-300 hover:text-blue-100 transition">Register</Link> */}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center text-blue-300">
              <p>&copy; 2025 My Invoice Online Co Ltd. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
