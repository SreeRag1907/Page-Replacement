"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MemoryAnimation = () => {
  const [step, setStep] = useState(0)
  const totalSteps = 5

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((prevStep) => (prevStep + 1) % totalSteps)
    }, 2000)

    return () => clearTimeout(timer)
  }, [step])

  const memoryFrames = [
    { id: 1, color: "bg-gray-200", content: null },
    { id: 2, color: "bg-gray-200", content: null },
    { id: 3, color: "bg-gray-200", content: null },
    { id: 4, color: "bg-gray-200", content: null },
  ]

  const pages = [
    { id: "A", color: "bg-blue-500" },
    { id: "B", color: "bg-green-500" },
    { id: "C", color: "bg-purple-500" },
    { id: "D", color: "bg-yellow-500" },
    { id: "E", color: "bg-red-500" },
  ]

  // Animation sequence
  const getAnimationState = () => {
    switch (step) {
      case 0:
        return {
          frames: [
            { ...memoryFrames[0], content: null },
            { ...memoryFrames[1], content: null },
            { ...memoryFrames[2], content: null },
            { ...memoryFrames[3], content: null },
          ],
          currentPage: pages[0],
          message: "Memory starts empty",
        }
      case 1:
        return {
          frames: [
            { ...memoryFrames[0], content: pages[0] },
            { ...memoryFrames[1], content: null },
            { ...memoryFrames[2], content: null },
            { ...memoryFrames[3], content: null },
          ],
          currentPage: pages[1],
          message: "Page A loaded into memory",
        }
      case 2:
        return {
          frames: [
            { ...memoryFrames[0], content: pages[0] },
            { ...memoryFrames[1], content: pages[1] },
            { ...memoryFrames[2], content: null },
            { ...memoryFrames[3], content: null },
          ],
          currentPage: pages[2],
          message: "Page B loaded into memory",
        }
      case 3:
        return {
          frames: [
            { ...memoryFrames[0], content: pages[0] },
            { ...memoryFrames[1], content: pages[1] },
            { ...memoryFrames[2], content: pages[2] },
            { ...memoryFrames[3], content: null },
          ],
          currentPage: pages[3],
          message: "Page C loaded into memory",
        }
      case 4:
        return {
          frames: [
            { ...memoryFrames[0], content: pages[0] },
            { ...memoryFrames[1], content: pages[1] },
            { ...memoryFrames[2], content: pages[2] },
            { ...memoryFrames[3], content: pages[3] },
          ],
          currentPage: pages[4],
          message: "Page D loaded into memory",
        }
      default:
        return {
          frames: memoryFrames,
          currentPage: null,
          message: "",
        }
    }
  }

  const animationState = getAnimationState()

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Memory Frames</h3>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs mb-6">
        {animationState.frames.map((frame, idx) => (
          <motion.div
            key={frame.id}
            className="border-2 border-gray-300 rounded-lg h-12 flex items-center justify-center"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          >
            <AnimatePresence mode="wait">
              {frame.content ? (
                <motion.div
                  key={frame.content.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-bold ${frame.content.color}`}
                >
                  {frame.content.id}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-400"
                >
                  Empty
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {step < 5 && (
        <div className="mt-4 text-center">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Current Request:</span>
            {animationState.currentPage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex ml-2 w-8 h-8 ${animationState.currentPage.color} rounded-md items-center justify-center text-white font-bold`}
              >
                {animationState.currentPage.id}
              </motion.div>
            )}
          </div>
          <p className="text-sm text-gray-600">{animationState.message}</p>
        </div>
      )}
    </div>
  )
}

export default MemoryAnimation

