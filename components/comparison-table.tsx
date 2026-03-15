"use client"

import { Check, X, Sparkles } from "lucide-react"

const comparisonData = [
  {
    feature: "Divine Message Capture",
    description: "Record and organize spiritual insights and revelations",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Spiritual Context Integration",
    description: "Connect daily tasks with biblical principles and faith",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Task Linking to Revelation",
    description: "Transform spiritual insights into actionable steps",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Sacred Time Blocking",
    description: "Schedule activities around prayer and devotional time",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Faith-Based Goal Setting",
    description: "Align personal objectives with spiritual calling",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Scripture-Guided Planning",
    description: "Use biblical wisdom to inform daily decisions",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Prayer Request Tracking",
    description: "Monitor and celebrate answered prayers over time",
    journals: false,
    productivity: false,
    altar: true,
  },
  {
    feature: "Spiritual Growth Metrics",
    description: "Measure progress in faith journey and character development",
    journals: false,
    productivity: false,
    altar: true,
  },
]

export default function ComparisonTable() {
  return (
    <section className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#A7C2D7] mr-3" />
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
              Beyond Traditional Tools
            </h2>
            <Sparkles className="w-8 h-8 text-[#A7C2D7] ml-3" />
          </div>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
            Discover how ALTAR transcends ordinary journals and productivity apps to create a truly sacred planning
            experience
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden border border-[#A7C2D7]/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10">
                  <tr>
                    <th className="px-6 py-6 text-left">
                      <span className="font-playfair text-xl font-semibold text-[#3C1E38]">Features</span>
                    </th>
                    <th className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-playfair text-xl font-semibold text-[#3C1E38] mb-2">Journals</span>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">📔</span>
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-playfair text-xl font-semibold text-[#3C1E38] mb-2">
                          Productivity Tools
                        </span>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">⚡</span>
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-playfair text-xl font-semibold text-[#3C1E38] mb-2">ALTAR</span>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                          <span className="text-2xl">✨</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t border-gray-100 hover:bg-[#FBF8F3]/50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-[#FBF8F3]/30"
                      }`}
                    >
                      <td className="px-6 py-6">
                        <div>
                          <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-1">{row.feature}</h4>
                          <p className="font-inter text-sm text-[#3C1E38]/60">{row.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-400" strokeWidth={2} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-400" strokeWidth={2} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center animate-pulse">
                            <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-6">
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-[#A7C2D7]/20 hover:shadow-xl transition-shadow duration-300"
              >
                <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">{row.feature}</h4>
                <p className="font-inter text-sm text-[#3C1E38]/60 mb-4">{row.description}</p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs font-inter text-[#3C1E38]/70 mb-2">Journals</div>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-400" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-inter text-[#3C1E38]/70 mb-2">Productivity</div>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-400" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-inter text-[#3C1E38]/70 mb-2">ALTAR</div>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-white mr-2" />
              <span className="font-inter font-semibold text-white">Experience the Sacred Difference</span>
              <Sparkles className="w-5 h-5 text-white ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
