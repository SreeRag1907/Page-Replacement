import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import MemoryAnimation from "@/components/memory-animation"
import AlgorithmCard from "@/components/algorithm-card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Page Replacement Algorithm Visualizer</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Understand how operating systems manage memory through interactive visualizations
            </p>
            <Link href="/visualizer" passHref>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-lg font-medium"
              >
                START VISUALIZATION <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What is Paging Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">What is Paging?</h2>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-gray-700 mb-4">
                  <strong>Paging</strong> is a memory management scheme that eliminates the need for contiguous
                  allocation of physical memory. It allows the physical address space of a process to be non-contiguous.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  In this scheme, the computer's memory is divided into fixed-size blocks called <strong>frames</strong>
                  , and each process is divided into blocks of the same size called <strong>pages</strong>.
                </p>
                <p className="text-lg text-gray-700">
                  When a program needs to be executed, its pages are loaded into available memory frames. If a required
                  page is not in memory (a <strong>page fault</strong>), the operating system must replace an existing
                  page with the required one.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <MemoryAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page Replacement Section */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Page Replacement</h2>
            <p className="text-xl text-gray-700 mb-12 text-center">
              When a page fault occurs, the operating system needs to choose which page to replace
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              <AlgorithmCard
                title="FIFO"
                description="First-In-First-Out replaces the oldest page in memory, regardless of how frequently it's used."
                icon="clock"
              />
              <AlgorithmCard
                title="LRU"
                description="Least Recently Used replaces the page that hasn't been used for the longest period of time."
                icon="history"
              />
              <AlgorithmCard
                title="Optimal"
                description="Replaces the page that will not be used for the longest period of time in the future."
                icon="target"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              How Page Replacement Works
            </h2>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8">
              <ol className="list-decimal pl-5 space-y-4">
                <li className="text-lg text-gray-700">
                  <strong>Page Fault Occurs:</strong> When a process requests a page that is not currently in memory, a
                  page fault is triggered.
                </li>
                <li className="text-lg text-gray-700">
                  <strong>Find Empty Frame:</strong> If there is an empty frame available, the OS allocates it to the
                  requested page.
                </li>
                <li className="text-lg text-gray-700">
                  <strong>Replacement Decision:</strong> If no empty frames are available, the OS must select a victim
                  page to replace using a page replacement algorithm.
                </li>
                <li className="text-lg text-gray-700">
                  <strong>Page Replacement:</strong> The victim page is removed from memory, and the requested page is
                  loaded into the freed frame.
                </li>
                <li className="text-lg text-gray-700">
                  <strong>Update Tables:</strong> The page tables are updated to reflect the new memory state.
                </li>
              </ol>
            </div>

            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to see it in action?</h3>
              <Link href="/visualizer" passHref>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-lg font-medium"
                >
                  START VISUALIZATION <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

