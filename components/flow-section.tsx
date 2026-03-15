"use client"

import { useEffect, useRef } from "react"

export default function FlowSection() {
  const arrowRef1 = useRef<SVGPathElement>(null)
  const arrowRef2 = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Animate the arrows
    const animateArrows = () => {
      if (arrowRef1.current && arrowRef2.current) {
        arrowRef1.current.style.strokeDashoffset = "0"
        setTimeout(() => {
          if (arrowRef2.current) {
            arrowRef2.current.style.strokeDashoffset = "0"
          }
        }, 1000)
      }
    }

    animateArrows()

    // Reset and replay animation periodically
    const interval = setInterval(() => {
      if (arrowRef1.current && arrowRef2.current) {
        arrowRef1.current.style.strokeDashoffset = "200"
        arrowRef2.current.style.strokeDashoffset = "200"

        setTimeout(animateArrows, 500)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          {/* Left Column - Flow Diagram */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <svg viewBox="0 0 400 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                {/* Receive Node */}
                <g className="node-group">
                  <circle
                    cx="200"
                    cy="80"
                    r="50"
                    className="node-circle"
                    fill="#FFFFFF"
                    stroke="#A7C2D7"
                    strokeWidth="2"
                  />
                  <circle
                    cx="200"
                    cy="80"
                    r="55"
                    className="node-glow"
                    fill="none"
                    stroke="#A7C2D7"
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="55;65;55" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="4s" repeatCount="indefinite" />
                  </circle>
                  <text
                    x="200"
                    y="80"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-playfair text-lg font-medium"
                    fill="#333333"
                  >
                    Receive
                  </text>
                </g>

                {/* First Arrow */}
                <path
                  ref={arrowRef1}
                  d="M200,130 Q200,160 200,190"
                  fill="none"
                  stroke="#A7C2D7"
                  strokeWidth="2"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  className="arrow-path"
                  markerEnd="url(#arrowhead)"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />

                {/* Reflect Node */}
                <g className="node-group">
                  <circle
                    cx="200"
                    cy="200"
                    r="50"
                    className="node-circle"
                    fill="#FFFFFF"
                    stroke="#A7C2D7"
                    strokeWidth="2"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    r="55"
                    className="node-glow"
                    fill="none"
                    stroke="#A7C2D7"
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="55;65;55" dur="4s" begin="1s" repeatCount="indefinite" />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.2;0.5"
                      dur="4s"
                      begin="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x="200"
                    y="200"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-playfair text-lg font-medium"
                    fill="#333333"
                  >
                    Reflect
                  </text>
                </g>

                {/* Second Arrow */}
                <path
                  ref={arrowRef2}
                  d="M200,250 Q200,280 200,310"
                  fill="none"
                  stroke="#A7C2D7"
                  strokeWidth="2"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  className="arrow-path"
                  markerEnd="url(#arrowhead)"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />

                {/* Respond Node */}
                <g className="node-group">
                  <circle
                    cx="200"
                    cy="320"
                    r="50"
                    className="node-circle"
                    fill="#FFFFFF"
                    stroke="#A7C2D7"
                    strokeWidth="2"
                  />
                  <circle
                    cx="200"
                    cy="320"
                    r="55"
                    className="node-glow"
                    fill="none"
                    stroke="#A7C2D7"
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="55;65;55" dur="4s" begin="2s" repeatCount="indefinite" />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.2;0.5"
                      dur="4s"
                      begin="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x="200"
                    y="320"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-playfair text-lg font-medium"
                    fill="#333333"
                  >
                    Respond
                  </text>
                </g>

                {/* Arrow Marker Definition */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#A7C2D7" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right Column - Feature Text */}
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              Divine Guidance to Daily Action
            </h2>

            {/* Feature 1 */}
            <div className="feature-block">
              <h3 className="font-playfair text-xl md:text-2xl font-semibold text-gray-700 mb-3">
                Receive with an Open Heart
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Begin each day in sacred stillness, creating space to receive divine wisdom. ALTAR guides you through
                personalized scripture readings, devotionals, and prayers aligned with your spiritual journey. Our
                curated content opens channels for heavenly inspiration to flow into your daily life.
              </p>
            </div>

            {/* Divider */}
            <div className="divider flex items-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
              <div className="mx-4">
                <div className="w-2 h-2 rounded-full bg-[#A7C2D7]"></div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
            </div>

            {/* Feature 2 */}
            <div className="feature-block">
              <h3 className="font-playfair text-xl md:text-2xl font-semibold text-gray-700 mb-3">
                Reflect with Intention
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Transform fleeting inspiration into lasting insight through guided reflection. ALTAR's journaling
                prompts, meditation exercises, and contemplative practices help you process divine guidance. Our
                thoughtfully designed tools create space for deep spiritual connection and personal revelation.
              </p>
            </div>

            {/* Divider */}
            <div className="divider flex items-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
              <div className="mx-4">
                <div className="w-2 h-2 rounded-full bg-[#A7C2D7]"></div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-grow"></div>
            </div>

            {/* Feature 3 */}
            <div className="feature-block">
              <h3 className="font-playfair text-xl md:text-2xl font-semibold text-gray-700 mb-3">
                Respond with Purpose
              </h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Move from insight to action with ALTAR's practical application tools. Set sacred intentions, create
                spiritual goals, and track your faith journey with purpose. Our gentle accountability features help you
                live out your values and divine guidance throughout each day, transforming moments of morning
                inspiration into a life of meaningful action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
