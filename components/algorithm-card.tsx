"use client"

import { motion } from "framer-motion"
import { Clock, History, Target } from "lucide-react"

interface AlgorithmCardProps {
  title: string
  description: string
  icon: "clock" | "history" | "target"
}

const AlgorithmCard = ({ title, description, icon }: AlgorithmCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case "clock":
        return <Clock className="h-10 w-10 text-blue-500" />
      case "history":
        return <History className="h-10 w-10 text-green-500" />
      case "target":
        return <Target className="h-10 w-10 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-gray-100 rounded-full">{getIcon()}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

export default AlgorithmCard

