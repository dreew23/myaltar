export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="h-20 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4 mx-auto animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded mb-12 w-1/2 mx-auto animate-pulse"></div>
        <div className="flex gap-4 justify-center">
          <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-12 w-40 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export function FeatureCardSkeleton() {
  return (
    <div className="bg-[#FBF8F3] rounded-lg p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-white/90 rounded-3xl p-8 animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
      <div className="h-6 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4 mx-auto"></div>
      <div className="h-6 bg-gray-200 rounded mb-6 w-1/2 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
    </div>
  )
}
