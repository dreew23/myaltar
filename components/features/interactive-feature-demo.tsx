"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Heart,
  BookOpen,
  Target,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { trackEvent } from "@/lib/safe-analytics"

interface UserScenario {
  id: string
  name: string
  persona: string
  description: string
  spiritualStage: "seeker" | "growing" | "mature" | "leader"
  icon: React.ReactNode
}

interface InteractiveFeatureDemoProps {
  featureId: string
  title: string
  description: string
  demoType: "prayer-tracking" | "sacred-planning" | "scripture-integration" | "spiritual-growth"
  onClose?: () => void
  isFullscreen?: boolean
}

const userScenarios: Record<string, UserScenario[]> = {
  "prayer-tracking": [
    {
      id: "new-believer",
      name: "Sarah",
      persona: "New Believer",
      description: "Just started her faith journey, learning to pray consistently",
      spiritualStage: "seeker",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "busy-parent",
      name: "Michael",
      persona: "Busy Parent",
      description: "Father of three, struggling to maintain prayer life amid chaos",
      spiritualStage: "growing",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "prayer-warrior",
      name: "Grace",
      persona: "Prayer Warrior",
      description: "Mature believer who intercedes for her community regularly",
      spiritualStage: "mature",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "ministry-leader",
      name: "Pastor David",
      persona: "Ministry Leader",
      description: "Leads a congregation, manages multiple prayer initiatives",
      spiritualStage: "leader",
      icon: <Target className="w-4 h-4" />,
    },
  ],
  "sacred-planning": [
    {
      id: "student",
      name: "Emma",
      persona: "College Student",
      description: "Balancing studies, relationships, and spiritual growth",
      spiritualStage: "growing",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "entrepreneur",
      name: "James",
      persona: "Christian Entrepreneur",
      description: "Building a business while staying true to Kingdom values",
      spiritualStage: "mature",
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "retiree",
      name: "Margaret",
      persona: "Retired Volunteer",
      description: "Newly retired, seeking God's purpose for this season",
      spiritualStage: "mature",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "young-professional",
      name: "Alex",
      persona: "Young Professional",
      description: "Climbing the career ladder while maintaining spiritual priorities",
      spiritualStage: "growing",
      icon: <User className="w-4 h-4" />,
    },
  ],
  "scripture-integration": [
    {
      id: "scripture-newbie",
      name: "Lisa",
      persona: "Scripture Newbie",
      description: "Wants to read the Bible but finds it overwhelming",
      spiritualStage: "seeker",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "bible-teacher",
      name: "Robert",
      persona: "Bible Teacher",
      description: "Prepares lessons and seeks fresh insights for teaching",
      spiritualStage: "leader",
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "life-struggles",
      name: "Maria",
      persona: "Going Through Trials",
      description: "Facing difficult circumstances, needs biblical encouragement",
      spiritualStage: "growing",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "discipleship",
      name: "John",
      persona: "Discipleship Focused",
      description: "Mentoring others and seeking deeper biblical understanding",
      spiritualStage: "mature",
      icon: <User className="w-4 h-4" />,
    },
  ],
  "spiritual-growth": [
    {
      id: "habit-builder",
      name: "Rachel",
      persona: "Habit Builder",
      description: "Trying to establish consistent spiritual disciplines",
      spiritualStage: "growing",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "spiritual-director",
      name: "Father Thomas",
      persona: "Spiritual Director",
      description: "Guides others in spiritual formation and contemplative practices",
      spiritualStage: "leader",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "recovering-addict",
      name: "Mark",
      persona: "In Recovery",
      description: "Using spiritual disciplines as part of recovery journey",
      spiritualStage: "growing",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "contemplative",
      name: "Sister Catherine",
      persona: "Contemplative",
      description: "Seeks deeper union with God through various spiritual practices",
      spiritualStage: "mature",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ],
}

export default function InteractiveFeatureDemo({
  featureId,
  title,
  description,
  demoType,
  onClose,
  isFullscreen = false,
}: InteractiveFeatureDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentScenario, setCurrentScenario] = useState(0)
  const [userInteractions, setUserInteractions] = useState<string[]>([])
  const [timeInDemo, setTimeInDemo] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  const scenarios = userScenarios[demoType] || []
  const activeScenario = scenarios[currentScenario]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying || autoPlay) {
      interval = setInterval(() => {
        setTimeInDemo((prev) => prev + 1)
        if (autoPlay && timeInDemo > 0 && timeInDemo % 3 === 0) {
          // Auto-advance scenario every 3 seconds in autoplay
          setCurrentScenario((prev) => (prev + 1) % scenarios.length)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, autoPlay, timeInDemo, scenarios.length])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    trackEvent("demo_interaction", "features", `${demoType}_${isPlaying ? "pause" : "play"}`)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setUserInteractions([])
    setIsPlaying(false)
    setTimeInDemo(0)
    setAutoPlay(false)
    trackEvent("demo_interaction", "features", `${demoType}_reset`)
  }

  const handleScenarioChange = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? (currentScenario + 1) % scenarios.length
        : (currentScenario - 1 + scenarios.length) % scenarios.length

    setCurrentScenario(newIndex)
    setUserInteractions([])
    setCurrentStep(0)
    trackEvent("demo_interaction", "features", `${demoType}_scenario_${scenarios[newIndex].id}`)
  }

  const handleUserInteraction = (interaction: string) => {
    setUserInteractions((prev) => [...prev, interaction])
    trackEvent("demo_interaction", "features", `${demoType}_${interaction}_${activeScenario.id}`)
  }

  // Enhanced Prayer Tracking Demo with Multiple Scenarios
  const renderPrayerTrackingDemo = () => {
    const scenarioData = {
      "new-believer": {
        prayers: [
          { text: "Help me understand the Bible better", category: "Growth", status: "ongoing", priority: "high" },
          { text: "Bless my family", category: "Family", status: "ongoing", priority: "medium" },
          {
            text: "Find a good church",
            status: userInteractions.includes("mark_answered") ? "answered" : "ongoing",
            category: "Community",
            priority: "high",
          },
        ],
        insights:
          "Sarah is building her foundation of faith. Notice how her prayers focus on understanding and community.",
        tips: "New believers benefit from simple prayer categories and gentle reminders.",
      },
      "busy-parent": {
        prayers: [
          { text: "Wisdom in parenting decisions", category: "Parenting", status: "ongoing", priority: "high" },
          {
            text: "Kids' safety at school",
            category: "Protection",
            status: userInteractions.includes("mark_answered") ? "answered" : "ongoing",
            priority: "high",
          },
          { text: "Marriage strength during busy season", category: "Marriage", status: "ongoing", priority: "medium" },
          { text: "Time for personal devotions", category: "Growth", status: "ongoing", priority: "medium" },
        ],
        insights:
          "Michael's prayers reflect the beautiful chaos of family life. He's learning to find God in the midst of busyness.",
        tips: "Busy parents need quick-access prayer logging and family-focused categories.",
      },
      "prayer-warrior": {
        prayers: [
          { text: "Revival in our city", category: "Revival", status: "ongoing", priority: "high" },
          { text: "Healing for Mrs. Johnson's cancer", category: "Healing", status: "ongoing", priority: "high" },
          { text: "Missionaries in Southeast Asia", category: "Missions", status: "ongoing", priority: "medium" },
          {
            text: "Church unity during leadership transition",
            category: "Church",
            status: userInteractions.includes("mark_answered") ? "answered" : "ongoing",
            priority: "high",
          },
          {
            text: "Breakthrough for struggling marriages",
            category: "Relationships",
            status: "ongoing",
            priority: "medium",
          },
        ],
        insights:
          "Grace intercedes for her community with strategic focus. Her prayers show mature spiritual warfare understanding.",
        tips: "Prayer warriors need advanced organization, team prayer features, and progress tracking.",
      },
      "ministry-leader": {
        prayers: [
          { text: "Sermon series on hope", category: "Ministry", status: "ongoing", priority: "high" },
          {
            text: "Youth pastor search",
            category: "Staffing",
            status: userInteractions.includes("mark_answered") ? "answered" : "ongoing",
            priority: "high",
          },
          { text: "Building fund campaign", category: "Finances", status: "ongoing", priority: "medium" },
          {
            text: "Congregational healing after conflict",
            category: "Pastoral Care",
            status: "ongoing",
            priority: "high",
          },
          { text: "Personal spiritual renewal", category: "Personal", status: "ongoing", priority: "medium" },
        ],
        insights:
          "Pastor David balances congregational needs with personal spiritual health. Leadership prayers require different tracking.",
        tips: "Ministry leaders benefit from delegation features, team prayer coordination, and pastoral care tracking.",
      },
    }

    const data = scenarioData[activeScenario.id as keyof typeof scenarioData]

    return (
      <div className="space-y-6">
        {/* Scenario Header */}
        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {activeScenario.icon}
            <div>
              <h4 className="font-playfair font-semibold text-[#3C1E38]">{activeScenario.name}</h4>
              <p className="text-sm text-[#3C1E38]/70">{activeScenario.description}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {activeScenario.spiritualStage}
            </Badge>
          </div>
        </div>

        {/* Prayer Interface */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">Prayer Requests</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleUserInteraction("add_prayer")}
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
              >
                + Add Prayer
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleUserInteraction("organize_prayers")}>
                Organize
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {data.prayers.map((prayer, i) => (
              <div
                key={i}
                className="bg-[#FBF8F3] rounded-lg p-4 border border-[#A7C2D7]/20 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-inter text-[#3C1E38] flex-1">{prayer.text}</span>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        prayer.priority === "high"
                          ? "border-red-200 text-red-600"
                          : prayer.priority === "medium"
                            ? "border-yellow-200 text-yellow-600"
                            : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {prayer.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {prayer.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      prayer.status === "answered" ? "bg-green-100 text-green-600" : "bg-[#A7C2D7]/20 text-[#A7C2D7]"
                    }`}
                  >
                    {prayer.status}
                  </span>
                  {prayer.status === "ongoing" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserInteraction("add_update")}
                        className="text-xs"
                      >
                        Add Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserInteraction("mark_answered")}
                        className="text-xs"
                      >
                        Mark Answered
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feedback */}
          {userInteractions.includes("add_prayer") && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                ✨ New prayer added! ALTAR automatically suggests categories based on your prayer content.
              </p>
            </div>
          )}

          {userInteractions.includes("organize_prayers") && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-700 text-sm">
                📋 Prayers organized by category! You can also sort by priority, date, or status.
              </p>
            </div>
          )}

          {userInteractions.includes("mark_answered") && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                🙏 Praise God! Answered prayers are automatically added to your testimony collection.
              </p>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-[#F9D57E]/10 to-[#A7C2D7]/10 rounded-lg p-4">
          <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Spiritual Insights</h4>
          <p className="font-inter text-sm text-[#3C1E38]/70 mb-3">{data.insights}</p>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="font-inter text-xs text-[#3C1E38]/60">
              <strong>Design Tip:</strong> {data.tips}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Sacred Planning Demo
  const renderSacredPlanningDemo = () => {
    const scenarioData = {
      student: {
        tasks: [
          {
            text: "Morning devotions before classes",
            priority: "Kingdom",
            completed: userInteractions.includes("complete_devotion"),
            timeBlock: "6:00 AM",
          },
          { text: "Study for midterm exams", priority: "Stewardship", completed: false, timeBlock: "2:00 PM" },
          { text: "Call parents", priority: "Love", completed: true, timeBlock: "7:00 PM" },
          { text: "Campus ministry meeting", priority: "Kingdom", completed: false, timeBlock: "8:00 PM" },
        ],
        insights:
          "Emma is learning to integrate faith with academic life. Her schedule reflects Kingdom priorities even in busy seasons.",
        weeklyGoals: ["Maintain 4.0 GPA", "Lead Bible study", "Exercise 3x/week", "Volunteer at shelter"],
      },
      entrepreneur: {
        tasks: [
          {
            text: "Pray over business decisions",
            priority: "Kingdom",
            completed: userInteractions.includes("complete_prayer"),
            timeBlock: "5:30 AM",
          },
          {
            text: "Team meeting - discuss company values",
            priority: "Stewardship",
            completed: false,
            timeBlock: "9:00 AM",
          },
          { text: "Lunch with mentor", priority: "Growth", completed: false, timeBlock: "12:00 PM" },
          {
            text: "Review ethical implications of new contract",
            priority: "Kingdom",
            completed: false,
            timeBlock: "3:00 PM",
          },
          { text: "Family dinner (no phones)", priority: "Love", completed: true, timeBlock: "6:00 PM" },
        ],
        insights:
          "James integrates Kingdom values into business decisions. His planning reflects both profit and purpose.",
        weeklyGoals: [
          "Launch ethical product line",
          "Mentor young entrepreneur",
          "Increase employee satisfaction",
          "Tithe 15% of profits",
        ],
      },
      retiree: {
        tasks: [
          {
            text: "Extended prayer time",
            priority: "Kingdom",
            completed: userInteractions.includes("complete_prayer"),
            timeBlock: "6:00 AM",
          },
          { text: "Visit nursing home residents", priority: "Love", completed: false, timeBlock: "10:00 AM" },
          { text: "Prepare Sunday school lesson", priority: "Kingdom", completed: false, timeBlock: "2:00 PM" },
          { text: "Garden therapy", priority: "Rest", completed: true, timeBlock: "4:00 PM" },
          { text: "Call grandchildren", priority: "Love", completed: false, timeBlock: "7:00 PM" },
        ],
        insights:
          "Margaret is discovering God's purpose for this new season. Her schedule reflects increased ministry and family focus.",
        weeklyGoals: [
          "Disciple 2 younger women",
          "Complete Bible reading plan",
          "Organize church food drive",
          "Write family history",
        ],
      },
      "young-professional": {
        tasks: [
          {
            text: "Commute prayer time",
            priority: "Kingdom",
            completed: userInteractions.includes("complete_prayer"),
            timeBlock: "7:30 AM",
          },
          {
            text: "Integrity check in difficult client meeting",
            priority: "Kingdom",
            completed: false,
            timeBlock: "10:00 AM",
          },
          { text: "Lunch with non-Christian colleague", priority: "Mission", completed: false, timeBlock: "12:00 PM" },
          { text: "Gym workout", priority: "Stewardship", completed: true, timeBlock: "6:00 PM" },
          { text: "Small group Bible study", priority: "Kingdom", completed: false, timeBlock: "7:30 PM" },
        ],
        insights: "Alex is learning to be salt and light in the workplace while maintaining spiritual growth.",
        weeklyGoals: [
          "Excel in work projects",
          "Share faith naturally",
          "Maintain work-life balance",
          "Save for missions trip",
        ],
      },
    }

    const data = scenarioData[activeScenario.id as keyof typeof scenarioData]

    return (
      <div className="space-y-6">
        {/* Scenario Header */}
        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {activeScenario.icon}
            <div>
              <h4 className="font-playfair font-semibold text-[#3C1E38]">{activeScenario.name}</h4>
              <p className="text-sm text-[#3C1E38]/70">{activeScenario.description}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {activeScenario.spiritualStage}
            </Badge>
          </div>
        </div>

        {/* Daily Planning Interface */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">Today's Sacred Intentions</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleUserInteraction("add_task")}
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
              >
                + Add Task
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleUserInteraction("time_block")}>
                Time Block
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {data.tasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-[#A7C2D7]/20 hover:bg-[#FBF8F3] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleUserInteraction("complete_task")}
                  className="w-4 h-4 text-[#A7C2D7] rounded"
                />
                <div className="flex-1">
                  <span
                    className={`font-inter ${task.completed ? "line-through text-[#3C1E38]/50" : "text-[#3C1E38]"}`}
                  >
                    {task.text}
                  </span>
                  {task.timeBlock && <div className="text-xs text-[#3C1E38]/60 mt-1">📅 {task.timeBlock}</div>}
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    task.priority === "Kingdom"
                      ? "border-[#A7C2D7] text-[#A7C2D7]"
                      : task.priority === "Love"
                        ? "border-red-200 text-red-600"
                        : task.priority === "Mission"
                          ? "border-green-200 text-green-600"
                          : task.priority === "Growth"
                            ? "border-purple-200 text-purple-600"
                            : task.priority === "Rest"
                              ? "border-blue-200 text-blue-600"
                              : "border-[#F9D57E] text-[#F9D57E]"
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>

          {/* Weekly Goals Section */}
          <div className="mt-6 p-4 bg-[#FBF8F3] rounded-lg">
            <h4 className="font-inter font-semibold text-[#3C1E38] mb-3">This Week's Kingdom Goals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.weeklyGoals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#3C1E38]/70">
                  <div className="w-2 h-2 bg-[#A7C2D7] rounded-full"></div>
                  {goal}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feedback */}
          {userInteractions.includes("complete_task") && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✨ Task completed! Notice how Kingdom priorities energize your entire day.
              </p>
            </div>
          )}

          {userInteractions.includes("time_block") && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                ⏰ Time blocking activated! ALTAR helps you protect time for what matters most.
              </p>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-[#F9D57E]/10 to-[#A7C2D7]/10 rounded-lg p-4">
          <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Spiritual Insights</h4>
          <p className="font-inter text-sm text-[#3C1E38]/70">{data.insights}</p>
        </div>
      </div>
    )
  }

  // Continue with enhanced Scripture Integration and Spiritual Growth demos...
  const renderScriptureIntegrationDemo = () => {
    const scenarioData = {
      "scripture-newbie": {
        passage: {
          text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
          reference: "Jeremiah 29:11",
          context: "God's promise to the exiles in Babylon",
        },
        prompts: [
          "What does it mean that God has 'plans' for you?",
          "How does this verse speak to your current situation?",
          "What hopes do you have for your future?",
        ],
        insights:
          "Lisa needs simple, encouraging passages with clear application. The interface guides her gently into deeper study.",
        features: ["Audio narration", "Simple explanations", "Personal application", "Progress tracking"],
      },
      "bible-teacher": {
        passage: {
          text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.",
          reference: "2 Timothy 3:16-17",
          context: "Paul's final instructions to Timothy about Scripture's authority",
        },
        prompts: [
          "How does this passage inform your teaching methodology?",
          "What does 'God-breathed' mean in the original Greek?",
          "How can you help others see Scripture's practical relevance?",
        ],
        insights: "Robert needs advanced study tools, cross-references, and teaching preparation features.",
        features: ["Greek/Hebrew tools", "Commentary access", "Lesson planning", "Cross-references"],
      },
      "life-struggles": {
        passage: {
          text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
          reference: "Romans 8:28",
          context: "Paul's teaching on suffering and God's sovereignty",
        },
        prompts: [
          "How might God be working in your current struggles?",
          "What does it mean to be 'called according to his purpose'?",
          "How can you trust God's goodness in difficult times?",
        ],
        insights:
          "Maria needs comfort-focused passages with gentle prompts that acknowledge pain while pointing to hope.",
        features: ["Comfort verses", "Prayer integration", "Community support", "Gentle reminders"],
      },
      discipleship: {
        passage: {
          text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.",
          reference: "Matthew 28:19-20",
          context: "The Great Commission - Jesus' final instructions to his disciples",
        },
        prompts: [
          "How are you currently making disciples in your context?",
          "What does 'teaching them to obey' look like practically?",
          "How can you better equip those you're mentoring?",
        ],
        insights:
          "John needs discipleship-focused content with tools for mentoring others and tracking spiritual growth.",
        features: ["Mentoring tools", "Progress tracking", "Resource sharing", "Group studies"],
      },
    }

    const data = scenarioData[activeScenario.id as keyof typeof scenarioData]

    return (
      <div className="space-y-6">
        {/* Scenario Header */}
        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {activeScenario.icon}
            <div>
              <h4 className="font-playfair font-semibold text-[#3C1E38]">{activeScenario.name}</h4>
              <p className="text-sm text-[#3C1E38]/70">{activeScenario.description}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {activeScenario.spiritualStage}
            </Badge>
          </div>
        </div>

        {/* Scripture Interface */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-[#A7C2D7] font-medium">Today's Scripture</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleUserInteraction("listen_audio")}>
                  🔊 Listen
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleUserInteraction("share_verse")}>
                  📤 Share
                </Button>
              </div>
            </div>
            <blockquote className="font-playfair italic text-[#3C1E38] text-lg leading-relaxed mb-3">
              "{data.passage.text}"
            </blockquote>
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#3C1E38] font-medium">— {data.passage.reference}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUserInteraction("view_context")}
                className="text-xs"
              >
                View Context
              </Button>
            </div>
            {userInteractions.includes("view_context") && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-[#3C1E38]/70">
                  <strong>Context:</strong> {data.passage.context}
                </p>
              </div>
            )}
          </div>

          {/* Reflection Prompts */}
          <div className="space-y-4">
            <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Reflection Prompts</h4>
            {data.prompts.map((prompt, i) => (
              <div key={i} className="space-y-2">
                <p className="font-inter text-sm text-[#3C1E38]/70">{prompt}</p>
                <div
                  className="border border-dashed border-[#A7C2D7]/40 rounded-lg p-3 bg-[#FBF8F3]/50 cursor-pointer min-h-[60px]"
                  onClick={() => handleUserInteraction(`journal_prompt_${i}`)}
                >
                  {userInteractions.includes(`journal_prompt_${i}`) ? (
                    <div>
                      <p className="font-inter text-sm text-[#3C1E38] mb-2">
                        {i === 0 &&
                          "I'm learning that God's plans are often different from mine, but they're always better. Even when I can't see the full picture..."}
                        {i === 1 &&
                          "This verse reminds me that God sees my current struggles and has a purpose in them. I'm choosing to trust His timing..."}
                        {i === 2 &&
                          "My hopes include growing closer to God, finding meaningful work, and being used to help others. I believe God will fulfill these desires..."}
                      </p>
                      <Button size="sm" className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black">
                        Save Reflection
                      </Button>
                    </div>
                  ) : (
                    <p className="font-inter text-sm text-[#3C1E38]/60 italic">Tap to journal your thoughts...</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Showcase */}
          <div className="mt-6 p-4 bg-[#FBF8F3] rounded-lg">
            <h4 className="font-inter font-semibold text-[#3C1E38] mb-3">Available Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {data.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#3C1E38]/70">
                  <div className="w-2 h-2 bg-[#A7C2D7] rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Feedback */}
          {userInteractions.includes("listen_audio") && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                🎧 Audio playing! Perfect for commutes or when your eyes need a rest.
              </p>
            </div>
          )}

          {userInteractions.some((i) => i.startsWith("journal_prompt")) && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✍️ Beautiful reflection! Your insights are automatically saved and can be revisited anytime.
              </p>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-[#F9D57E]/10 to-[#A7C2D7]/10 rounded-lg p-4">
          <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Spiritual Insights</h4>
          <p className="font-inter text-sm text-[#3C1E38]/70">{data.insights}</p>
        </div>
      </div>
    )
  }

  const renderSpiritualGrowthDemo = () => {
    const scenarioData = {
      "habit-builder": {
        disciplines: [
          {
            name: "Prayer",
            progress: userInteractions.includes("log_prayer") ? 75 : 70,
            streak: 12,
            target: 30,
            difficulty: "building",
          },
          { name: "Scripture Reading", progress: 45, streak: 8, target: 21, difficulty: "struggling" },
          { name: "Journaling", progress: 60, streak: 15, target: 30, difficulty: "consistent" },
          { name: "Worship", progress: 80, streak: 25, target: 30, difficulty: "strong" },
        ],
        insights:
          "Rachel is building momentum! Her worship discipline is strong, providing a foundation for growth in other areas.",
        tips: "Start small, celebrate wins, and link new habits to existing strong ones.",
      },
      "spiritual-director": {
        disciplines: [
          { name: "Contemplative Prayer", progress: 95, streak: 180, target: 365, difficulty: "mastered" },
          { name: "Lectio Divina", progress: 90, streak: 120, target: 365, difficulty: "strong" },
          {
            name: "Spiritual Direction Sessions",
            progress: userInteractions.includes("log_session") ? 85 : 80,
            streak: 45,
            target: 52,
            difficulty: "consistent",
          },
          { name: "Retreat Planning", progress: 70, streak: 12, target: 12, difficulty: "seasonal" },
        ],
        insights: "Father Thomas models mature spiritual formation. His practices focus on depth and guiding others.",
        tips: "Advanced practitioners need tracking for both personal growth and ministry effectiveness.",
      },
      "recovering-addict": {
        disciplines: [
          {
            name: "Morning Prayer",
            progress: userInteractions.includes("log_prayer") ? 85 : 80,
            streak: 45,
            target: 90,
            difficulty: "crucial",
          },
          { name: "Scripture Meditation", progress: 75, streak: 30, target: 90, difficulty: "healing" },
          { name: "Gratitude Practice", progress: 90, streak: 60, target: 90, difficulty: "transformative" },
          { name: "Service to Others", progress: 65, streak: 20, target: 52, difficulty: "growing" },
        ],
        insights:
          "Mark's spiritual disciplines are literally life-saving. His gratitude practice shows remarkable consistency.",
        tips: "Recovery-focused tracking emphasizes consistency over perfection, with grace for difficult days.",
      },
      contemplative: {
        disciplines: [
          { name: "Centering Prayer", progress: 98, streak: 365, target: 365, difficulty: "mastered" },
          { name: "Divine Office", progress: 95, streak: 200, target: 365, difficulty: "strong" },
          { name: "Spiritual Reading", progress: 85, streak: 100, target: 365, difficulty: "consistent" },
          {
            name: "Contemplative Walks",
            progress: userInteractions.includes("log_walk") ? 80 : 75,
            streak: 90,
            target: 365,
            difficulty: "seasonal",
          },
        ],
        insights:
          "Sister Catherine demonstrates the fruit of decades of faithful practice. Her disciplines flow naturally from deep union with God.",
        tips: "Mature contemplatives need tools that honor the mystery while tracking the journey.",
      },
    }

    const data = scenarioData[activeScenario.id as keyof typeof scenarioData]

    return (
      <div className="space-y-6">
        {/* Scenario Header */}
        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {activeScenario.icon}
            <div>
              <h4 className="font-playfair font-semibold text-[#3C1E38]">{activeScenario.name}</h4>
              <p className="text-sm text-[#3C1E38]/70">{activeScenario.description}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {activeScenario.spiritualStage}
            </Badge>
          </div>
        </div>

        {/* Spiritual Disciplines Dashboard */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">Spiritual Disciplines</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleUserInteraction("quick_log")}
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
              >
                Quick Log
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleUserInteraction("view_insights")}>
                Insights
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {data.disciplines.map((discipline, i) => (
              <div
                key={i}
                className="space-y-3 p-4 rounded-lg border border-[#A7C2D7]/20 hover:bg-[#FBF8F3] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-inter font-medium text-[#3C1E38]">{discipline.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        discipline.difficulty === "mastered"
                          ? "border-green-200 text-green-600"
                          : discipline.difficulty === "strong"
                            ? "border-blue-200 text-blue-600"
                            : discipline.difficulty === "consistent"
                              ? "border-purple-200 text-purple-600"
                              : discipline.difficulty === "building"
                                ? "border-yellow-200 text-yellow-600"
                                : discipline.difficulty === "struggling"
                                  ? "border-red-200 text-red-600"
                                  : discipline.difficulty === "crucial"
                                    ? "border-orange-200 text-orange-600"
                                    : discipline.difficulty === "healing"
                                      ? "border-teal-200 text-teal-600"
                                      : discipline.difficulty === "transformative"
                                        ? "border-pink-200 text-pink-600"
                                        : discipline.difficulty === "growing"
                                          ? "border-indigo-200 text-indigo-600"
                                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {discipline.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-[#A7C2D7] font-medium">{discipline.streak} day streak</div>
                      <div className="text-xs text-[#3C1E38]/60">
                        {discipline.progress}% of {discipline.target} days
                      </div>
                    </div>
                    {(discipline.name === "Prayer" || discipline.name === "Morning Prayer") &&
                      !userInteractions.includes("log_prayer") && (
                        <Button
                          size="sm"
                          onClick={() => handleUserInteraction("log_prayer")}
                          className="text-xs bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
                        >
                          Log Today
                        </Button>
                      )}
                    {discipline.name === "Contemplative Walks" && !userInteractions.includes("log_walk") && (
                      <Button
                        size="sm"
                        onClick={() => handleUserInteraction("log_walk")}
                        className="text-xs bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
                      >
                        Log Walk
                      </Button>
                    )}
                    {discipline.name === "Spiritual Direction Sessions" &&
                      !userInteractions.includes("log_session") && (
                        <Button
                          size="sm"
                          onClick={() => handleUserInteraction("log_session")}
                          className="text-xs bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black"
                        >
                          Log Session
                        </Button>
                      )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      discipline.difficulty === "mastered"
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : discipline.difficulty === "strong"
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : discipline.difficulty === "consistent"
                            ? "bg-gradient-to-r from-purple-400 to-purple-600"
                            : discipline.difficulty === "crucial"
                              ? "bg-gradient-to-r from-orange-400 to-orange-600"
                              : discipline.difficulty === "transformative"
                                ? "bg-gradient-to-r from-pink-400 to-pink-600"
                                : "bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E]"
                    }`}
                    style={{ width: `${discipline.progress}%` }}
                  ></div>
                </div>

                {/* Streak Visualization */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(discipline.streak, 30) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx < discipline.streak ? "bg-[#A7C2D7]" : "bg-gray-200"}`}
                    ></div>
                  ))}
                  {discipline.streak > 30 && (
                    <span className="text-xs text-[#3C1E38]/60 ml-2">+{discipline.streak - 30} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feedback */}
          {userInteractions.includes("log_prayer") && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-700 text-sm">
                🌟 Beautiful! Your prayer discipline continues to grow. Consistency builds spiritual strength.
              </p>
            </div>
          )}

          {userInteractions.includes("log_walk") && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                🚶‍♀️ Contemplative walk logged! Walking with God brings both physical and spiritual renewal.
              </p>
            </div>
          )}

          {userInteractions.includes("log_session") && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                🤝 Spiritual direction session recorded! Your ministry of guidance is bearing fruit.
              </p>
            </div>
          )}

          {userInteractions.includes("view_insights") && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg">
              <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Growth Insights</h4>
              <div className="space-y-2 text-sm text-[#3C1E38]/70">
                <p>• Your strongest discipline can anchor growth in weaker areas</p>
                <p>• Consistency matters more than perfection - grace covers the gaps</p>
                <p>• Spiritual seasons affect discipline patterns - that's normal</p>
                <p>• Community accountability accelerates growth</p>
              </div>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-[#F9D57E]/10 to-[#A7C2D7]/10 rounded-lg p-4">
          <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Spiritual Insights</h4>
          <p className="font-inter text-sm text-[#3C1E38]/70 mb-3">{data.insights}</p>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="font-inter text-xs text-[#3C1E38]/60">
              <strong>Design Tip:</strong> {data.tips}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderDemo = () => {
    switch (demoType) {
      case "prayer-tracking":
        return renderPrayerTrackingDemo()
      case "sacred-planning":
        return renderSacredPlanningDemo()
      case "scripture-integration":
        return renderScriptureIntegrationDemo()
      case "spiritual-growth":
        return renderSpiritualGrowthDemo()
      default:
        return <div>Demo not available</div>
    }
  }

  const containerClass = isFullscreen
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    : "relative"

  const contentClass = isFullscreen
    ? "bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
    : "bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20"

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Demo Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-1">{title}</h3>
            <p className="font-inter text-sm text-[#3C1E38]/70">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoPlay(!autoPlay)}
              className={autoPlay ? "bg-[#A7C2D7]/20" : ""}
            >
              Auto
            </Button>
            {!isFullscreen && (
              <Button size="sm" variant="outline">
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            {isFullscreen && onClose && (
              <Button size="sm" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Scenario Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-[#A7C2D7]/20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleScenarioChange("prev")}
            disabled={scenarios.length <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#3C1E38]/60">
              Scenario {currentScenario + 1} of {scenarios.length}
            </span>
            <div className="flex gap-1">
              {scenarios.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentScenario ? "bg-[#A7C2D7]" : "bg-gray-200"}`}
                ></div>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleScenarioChange("next")}
            disabled={scenarios.length <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Demo Content */}
        <div className="mb-6">{renderDemo()}</div>

        {/* Demo Instructions */}
        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
          <h4 className="font-inter font-semibold text-[#3C1E38] mb-2">Try It Yourself</h4>
          <p className="font-inter text-sm text-[#3C1E38]/70 mb-3">
            Click on the interactive elements above to experience how this feature adapts to different spiritual
            journeys and life contexts.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#3C1E38]/60">
            <span>⏱️ Time in demo: {timeInDemo}s</span>
            <span>🎯 Interactions: {userInteractions.length}</span>
            <span>👤 Current persona: {activeScenario.persona}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
