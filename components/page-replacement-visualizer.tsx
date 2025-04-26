"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, FastForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type AlgorithmType = "fifo" | "lru" | "optimal"

interface FrameState {
  page: number | null
  isNew: boolean
  isHit: boolean
}

interface StepState {
  frames: FrameState[]
  currentPage: number
  isPageFault: boolean
  replacedFrameIndex: number | null
}

const PageReplacementVisualizer = () => {
  const [referenceString, setReferenceString] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2")
  const [parsedReferenceString, setParsedReferenceString] = useState<number[]>([])
  const [frameCount, setFrameCount] = useState(3)
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("fifo")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<StepState[]>([])
  const [pageFaults, setPageFaults] = useState(0)
  const [pageHits, setPageHits] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState("")
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Parse reference string
  useEffect(() => {
    try {
      const parsed = referenceString
        .trim()
        .split(/\s+/)
        .map((num) => {
          const parsed = Number.parseInt(num, 10)
          if (isNaN(parsed)) throw new Error("Invalid reference string")
          return parsed
        })
      setParsedReferenceString(parsed)
      setError("")
    } catch (err) {
      setError("Please enter valid numbers separated by spaces")
    }
  }, [referenceString])

  // Generate steps based on algorithm
  const generateSteps = () => {
    if (parsedReferenceString.length === 0 || frameCount <= 0) return

    const result: StepState[] = []
    const frames: (number | null)[] = Array(frameCount).fill(null)
    let faults = 0
    let hits = 0

    // Initialize with empty frames
    result.push({
      frames: frames.map((page) => ({ page, isNew: false, isHit: false })),
      currentPage: -1,
      isPageFault: false,
      replacedFrameIndex: null,
    })

    if (algorithm === "fifo") {
      const queue: number[] = []

      parsedReferenceString.forEach((page) => {
        const framesCopy = [...frames]
        const isPageFault = !frames.includes(page)
        let replacedFrameIndex = null

        if (isPageFault) {
          faults++
          if (queue.length === frameCount) {
            const oldestPage = queue.shift()!
            replacedFrameIndex = frames.indexOf(oldestPage)
            frames[replacedFrameIndex] = page
          } else {
            const emptyIndex = frames.indexOf(null)
            frames[emptyIndex] = page
            replacedFrameIndex = emptyIndex
          }
          queue.push(page)
        } else {
          hits++
        }

        result.push({
          frames: frames.map((p, idx) => ({
            page: p,
            isNew: idx === replacedFrameIndex,
            isHit: p === page && !isPageFault,
          })),
          currentPage: page,
          isPageFault,
          replacedFrameIndex,
        })
      })
    } else if (algorithm === "lru") {
      const lastUsed: Record<number, number> = {}

      parsedReferenceString.forEach((page, timeStep) => {
        const framesCopy = [...frames]
        const isPageFault = !frames.includes(page)
        let replacedFrameIndex = null

        if (isPageFault) {
          faults++
          const nullIndex = frames.indexOf(null)

          if (nullIndex !== -1) {
            // There's an empty frame
            frames[nullIndex] = page
            replacedFrameIndex = nullIndex
          } else {
            // Find least recently used page
            let lruPage = -1
            let lruTime = Number.POSITIVE_INFINITY

            for (let i = 0; i < frames.length; i++) {
              const framePageTime = lastUsed[frames[i]!] || 0
              if (framePageTime < lruTime) {
                lruTime = framePageTime
                lruPage = i
              }
            }

            replacedFrameIndex = lruPage
            frames[lruPage] = page
          }
        } else {
          hits++
        }

        // Update last used time for this page
        lastUsed[page] = timeStep

        result.push({
          frames: frames.map((p, idx) => ({
            page: p,
            isNew: idx === replacedFrameIndex,
            isHit: p === page && !isPageFault,
          })),
          currentPage: page,
          isPageFault,
          replacedFrameIndex,
        })
      })
    } else if (algorithm === "optimal") {
      parsedReferenceString.forEach((page, index) => {
        const framesCopy = [...frames]
        const isPageFault = !frames.includes(page)
        let replacedFrameIndex = null

        if (isPageFault) {
          faults++
          const nullIndex = frames.indexOf(null)

          if (nullIndex !== -1) {
            // There's an empty frame
            frames[nullIndex] = page
            replacedFrameIndex = nullIndex
          } else {
            // Find the page that won't be used for the longest time
            const futureUse: Record<number, number> = {}

            // Initialize with "infinity" (won't be used again)
            frames.forEach((p) => {
              if (p !== null) futureUse[p] = Number.POSITIVE_INFINITY
            })

            // Find next occurrence of each page in frames
            for (let i = index + 1; i < parsedReferenceString.length; i++) {
              const futurePage = parsedReferenceString[i]
              if (frames.includes(futurePage) && futureUse[futurePage] === Number.POSITIVE_INFINITY) {
                futureUse[futurePage] = i
              }
            }

            // Find the page that will not be used for the longest time
            let victimPage = -1
            let farthestUse = -1

            for (let i = 0; i < frames.length; i++) {
              const frame = frames[i]!
              if (futureUse[frame] > farthestUse) {
                farthestUse = futureUse[frame]
                victimPage = i
              }
            }

            replacedFrameIndex = victimPage
            frames[victimPage] = page
          }
        } else {
          hits++
        }

        result.push({
          frames: frames.map((p, idx) => ({
            page: p,
            isNew: idx === replacedFrameIndex,
            isHit: p === page && !isPageFault,
          })),
          currentPage: page,
          isPageFault,
          replacedFrameIndex,
        })
      })
    }

    setSteps(result)
    setPageFaults(faults)
    setPageHits(hits)
    setCurrentStep(0)
    setIsPlaying(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }

  // Handle animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1000 / speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleSkipToEnd = () => {
    setIsPlaying(false)
    setCurrentStep(steps.length - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateSteps()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Set up your page replacement simulation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference-string">Reference String</Label>
                <Input
                  id="reference-string"
                  value={referenceString}
                  onChange={(e) => setReferenceString(e.target.value)}
                  placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="frame-count">Number of Frames</Label>
                <Input
                  id="frame-count"
                  type="number"
                  min="1"
                  max="10"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Number.parseInt(e.target.value, 10))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as AlgorithmType)}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">First-In-First-Out (FIFO)</SelectItem>
                  <SelectItem value="lru">Least Recently Used (LRU)</SelectItem>
                  <SelectItem value="optimal">Optimal Page Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!!error}>
              Generate Visualization
            </Button>
          </form>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
            <CardDescription>
              {algorithm === "fifo"
                ? "First-In-First-Out (FIFO) replaces the oldest page in memory"
                : algorithm === "lru"
                  ? "Least Recently Used (LRU) replaces the page that hasn't been used for the longest time"
                  : "Optimal replaces the page that won't be used for the longest time in the future"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Animation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={isPlaying ? handlePause : handlePlay}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleReset}>
                        <RotateCcw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleSkipToEnd}>
                        <FastForward size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Skip to End</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-500">Speed:</span>
                  <div className="w-32">
                    <Slider
                      value={[speed]}
                      min={0.5}
                      max={3}
                      step={0.5}
                      onValueChange={(value) => setSpeed(value[0])}
                    />
                  </div>
                  <span className="text-sm font-medium">{speed}x</span>
                </div>

                <div className="ml-auto text-sm">
                  Step: {currentStep} / {steps.length - 1}
                </div>
              </div>

              {/* Current Page */}
              {currentStep > 0 && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Current Page Request</div>
                  <div className="text-3xl font-bold">{steps[currentStep].currentPage}</div>
                  <div className="mt-2 text-sm font-medium">
                    {steps[currentStep].isPageFault ? (
                      <span className="text-red-500">Page Fault</span>
                    ) : (
                      <span className="text-green-500">Page Hit</span>
                    )}
                  </div>
                </div>
              )}

              {/* Horizontal Timeline with Animated Frames */}
              {currentStep > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Access Timeline</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-gray-100">Frame</th>
                          {steps.slice(1, currentStep + 1).map((step, idx) => (
                            <th key={idx} className="border p-2 bg-gray-100 min-w-[60px]">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{step.currentPage}</span>
                                <span
                                  className={cn(
                                    "text-xs mt-1 px-2 py-0.5 rounded-full",
                                    step.isPageFault ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
                                  )}
                                >
                                  {step.isPageFault ? "Fault" : "Hit"}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: frameCount }).map((_, frameIdx) => (
                          <tr key={frameIdx}>
                            <td className="border p-2 text-center font-medium bg-gray-50">Frame {frameIdx + 1}</td>
                            {steps.slice(1, currentStep + 1).map((step, stepIdx) => {
                              const frame = step.frames[frameIdx]
                              const isReplaced = step.replacedFrameIndex === frameIdx
                              return (
                                <td
                                  key={stepIdx}
                                  className={cn(
                                    "border p-2 text-center relative h-16",
                                    stepIdx === currentStep - 1 && "bg-blue-50",
                                  )}
                                >
                                  <AnimatePresence mode="wait">
                                    <motion.div
                                      key={`${stepIdx}-${frameIdx}-${frame.page}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ duration: 0.3 }}
                                      className={cn(
                                        "w-full h-full flex items-center justify-center rounded-md",
                                        frame.isHit ? "bg-green-100" : isReplaced ? "bg-red-100" : "",
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "text-xl font-bold",
                                          frame.isHit ? "text-green-700" : isReplaced ? "text-red-700" : "",
                                        )}
                                      >
                                        {frame.page !== null ? frame.page : "-"}
                                      </span>
                                    </motion.div>
                                  </AnimatePresence>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Page Hits</div>
                  <div className="text-2xl font-bold text-green-600">
                    {currentStep > 0 ? steps.slice(1, currentStep + 1).filter((step) => !step.isPageFault).length : 0}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Page Faults</div>
                  <div className="text-2xl font-bold text-red-600">
                    {currentStep > 0 ? steps.slice(1, currentStep + 1).filter((step) => step.isPageFault).length : 0}
                  </div>
                </div>
              </div>
            </div>

 {/* Hit and Fault Ratios */}
<div className="grid grid-cols-2 gap-4 mt-6">
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
    <div className="text-sm text-gray-500 mb-1">Hit Ratio</div>
    <div className="text-2xl font-bold text-blue-600">
      {steps.length > 0 && currentStep === steps.length - 1
        ? (pageHits + pageFaults > 0 ? (pageHits / (pageHits + pageFaults)).toFixed(2) : "0.00")
        : "0.00"}
    </div>
    <div className="text-sm text-gray-500 mt-1">Formula: Hits / (Hits + Faults)</div>
  </div>
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
    <div className="text-sm text-gray-500 mb-1">Fault Ratio</div>
    <div className="text-2xl font-bold text-yellow-600">
      {steps.length > 0 && currentStep === steps.length - 1
        ? (pageHits + pageFaults > 0 ? (pageFaults / (pageHits + pageFaults)).toFixed(2) : "0.00")
        : "0.00"}
    </div>
    <div className="text-sm text-gray-500 mt-1">Formula: Faults / (Hits + Faults)</div>
  </div>
</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PageReplacementVisualizer

