"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Heart, BookOpen, Target, Users, Calendar, Sparkles, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/safe-analytics"

interface SpiritualMetric {
  name: string
  value: number
  trend: "up" | "down" | "stable"
  insight: string
  recommendation: string
}

interface GrowthPattern {
  area: string
  progress: number
  consistency: number
  nextMilestone: string
  timeToMilestone: string
}

export default function AIInsightsDashboard() {
  const [metrics, setMetrics] = useState<SpiritualMetric[]>([])
  const [growthPatterns, setGrowthPatterns] = useState<GrowthPattern[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    generateInsights()
  }, [])

  const generateInsights = async () => {
    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setMetrics([
      {
        name: "Prayer Consistency",
        value: 85,
        trend: "up",
        insight: "Your prayer life has strengthened significantly over the past month",
        recommendation: "Consider adding contemplative prayer to deepen your practice",
      },
      {
        name: "Scripture Engagement",
        value: 72,
        trend: "stable",
        insight: "Steady engagement with daily readings, but room for deeper study",
        recommendation: "Try the Lectio Divina method for more meditative reading",
      },
      {
        name: "Community Connection",
        value: 60,
        trend: "down",
        insight: "Less community interaction lately - this affects spiritual growth",
        recommendation: "Schedule regular fellowship or join a small group",
      },
      {
        name: "Service & Mission",
        value: 45,
        trend: "stable",
        insight: "Opportunities for growth in serving others",
        recommendation: "Look for ways to use your gifts in ministry",
      },
    ])

    setGrowthPatterns([
      {
        area: "Contemplative Prayer",
        progress: 30,
        consistency: 85,
        nextMilestone: "15-minute daily sessions",
        timeToMilestone: "3 weeks",
      },
      {
        area: "Scripture Memorization",
        progress: 60,
        consistency: 70,
        nextMilestone: "Complete Psalm 23",
        timeToMilestone: "1 week",
      },
      {
        area: "Spiritual Mentoring",
        progress: 15,
        consistency: 40,
        nextMilestone: "Find a mentor",
        timeToMilestone: "2 months",
      },
    ])

    setIsAnalyzing(false)
    trackEvent("ai_insights_generated", "features", "dashboard")
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200"
      case "down":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-[#A7C2D7]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-playfair text-xl font-semibold text-[#3C1E38]">AI Spiritual Insights Dashboard</h3>
            <p className="text-sm text-[#3C1E38]/70">
              Personalized analysis of your spiritual growth patterns and recommendations
            </p>
          </div>
          <Button
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="bg-white rounded-lg p-8 border border-[#A7C2D7]/20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">
              Analyzing Your Spiritual Journey
            </h4>
            <p className="text-sm text-[#3C1E38]/70">
              AI is reviewing your prayer patterns, scripture engagement, and growth metrics...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Spiritual Metrics */}
          <div className="bg-white rounded-lg p-6 border border-[#A7C2D7]/20">
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">Spiritual Health Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="border border-[#A7C2D7]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-inter font-medium text-[#3C1E38]">{metric.name}</h5>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getTrendColor(metric.trend)}`}
                    >
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">{metric.value}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-full transition-all duration-500"
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-[#3C1E38]/70 mb-2">{metric.insight}</p>
                  <div className="bg-[#FBF8F3] rounded-lg p-2">
                    <p className="text-xs text-[#3C1E38] font-medium">💡 {metric.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Patterns */}
          <div className="bg-white rounded-lg p-6 border border-[#A7C2D7]/20">
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">Growth Pattern Analysis</h4>
            <div className="space-y-4">
              {growthPatterns.map((pattern, index) => (
                <div key={index} className="border border-[#A7C2D7]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-inter font-medium text-[#3C1E38]">{pattern.area}</h5>
                    <Badge variant="outline" className="text-xs">
                      {pattern.timeToMilestone} to next milestone
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-[#3C1E38]/60 mb-1">Progress</div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pattern.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-[#3C1E38]/70 mt-1">{pattern.progress}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#3C1E38]/60 mb-1">Consistency</div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${pattern.consistency}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-[#3C1E38]/70 mt-1">{pattern.consistency}%</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-[#A7C2D7]" />
                      <span className="text-xs font-medium text-[#3C1E38]">Next Milestone</span>
                    </div>
                    <p className="text-xs text-[#3C1E38]/70">{pattern.nextMilestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-6">
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">Personalized Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-inter font-medium text-[#3C1E38]">Spiritual Focus</span>
                </div>
                <p className="text-sm text-[#3C1E38]/70 mb-2">
                  Your prayer consistency is strong. Consider deepening your practice with contemplative prayer.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Start Contemplative Practice
                </Button>
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-inter font-medium text-[#3C1E38]">Community Growth</span>
                </div>
                <p className="text-sm text-[#3C1E38]/70 mb-2">
                  Your community connection could be stronger. Consider joining a small group or finding a mentor.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Find Community
                </Button>
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="font-inter font-medium text-[#3C1E38]">Scripture Depth</span>
                </div>
                <p className="text-sm text-[#3C1E38]/70 mb-2">
                  Try Lectio Divina for deeper scripture meditation and understanding.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Learn Lectio Divina
                </Button>
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="font-inter font-medium text-[#3C1E38]">Service Opportunity</span>
                </div>
                <p className="text-sm text-[#3C1E38]/70 mb-2">
                  Your gifts in teaching could be used in ministry. Consider volunteering opportunities.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Explore Ministry
                </Button>
              </div>
            </div>
          </div>

          {/* Spiritual Seasons Insight */}
          <div className="bg-white rounded-lg p-6 border border-[#A7C2D7]/20">
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">
              Current Spiritual Season Analysis
            </h4>
            <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-[#A7C2D7]" />
                <div>
                  <h5 className="font-inter font-semibold text-[#3C1E38]">Season of Growth</h5>
                  <p className="text-sm text-[#3C1E38]/70">You're in a season of steady spiritual development</p>
                </div>
              </div>
              <p className="text-sm text-[#3C1E38]/70 mb-4">
                AI has detected consistent patterns of growth in your spiritual disciplines. This is an excellent time
                to:
              </p>
              <ul className="space-y-2 text-sm text-[#3C1E38]/70">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#A7C2D7] rounded-full"></div>
                  Deepen existing practices rather than adding new ones
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#A7C2D7] rounded-full"></div>
                  Consider mentoring someone newer in their faith journey
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#A7C2D7] rounded-full"></div>
                  Explore contemplative practices for deeper intimacy with God
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* AI Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="font-inter font-medium text-yellow-800 mb-1">AI Insights Disclaimer</h5>
            <p className="font-inter text-xs text-yellow-700">
              These insights are generated through pattern analysis and should supplement, not replace, personal
              discernment, Scripture study, and guidance from spiritual mentors. Always test AI recommendations against
              biblical truth and seek wisdom from mature believers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
