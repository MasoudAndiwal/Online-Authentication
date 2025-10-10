/**
 * Modern Animated Loading Component for Authentication
 */

import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 right-1/3 w-56 h-56 bg-indigo-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Animated Icon with Spinning Ring */}
        <div className="relative inline-block">
          {/* Outer Spinning Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 -m-4"
          >
            <div className="w-32 h-32 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
          </motion.div>

          {/* Middle Pulsing Ring */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 -m-2"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
          </motion.div>

          {/* Center Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Shield className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          {/* Orbiting Icons */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 -m-8"
          >
            <div className="relative w-40 h-40">
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
              >
                <Lock className="w-4 h-4 text-white" />
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.2 }}
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Loading Text with Animation */}
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Verifying Access
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base text-slate-600 font-medium"
          >
            Please wait while we authenticate your session...
          </motion.p>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-2 pt-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            ))}
          </div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200/50"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </motion.div>
          <span className="text-sm font-semibold text-slate-700">
            Secure Connection
          </span>
        </motion.div>
      </div>
    </div>
  );
}
