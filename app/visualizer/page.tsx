import PageReplacementVisualizer from "@/components/page-replacement-visualizer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function VisualizerPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" passHref>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Page Replacement Algorithm Visualizer</h1>
          <p className="text-gray-600 mb-8">Visualize how FIFO, LRU, and Optimal page replacement algorithms work</p>
        </div>
        <PageReplacementVisualizer />
      </div>
    </main>
  )
}

