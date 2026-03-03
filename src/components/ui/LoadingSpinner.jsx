export function LoadingSpinner({ size = 'medium', text, className = '' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  const borderSize = {
    small: 'border-2',
    medium: 'border-3',
    large: 'border-4',
    xlarge: 'border-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* 外部旋转环 */}
        <div
          className={`${sizeClasses[size]} ${borderSize[size]} border-gray-200 rounded-full`}
        ></div>
        
        {/* 内部旋转环 */}
        <div
          className={`${sizeClasses[size]} ${borderSize[size]} border-ai-primary border-t-transparent rounded-full absolute top-0 left-0 animate-spin`}
        ></div>
        
        {/* 可选的中心点 */}
        {size === 'large' || size === 'xlarge' ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`${
              size === 'large' ? 'w-4 h-4' : 'w-6 h-6'
            } bg-ai-primary/20 rounded-full`}></div>
          </div>
        ) : null}
      </div>
      
      {text && (
        <p className="mt-3 text-text-secondary text-sm font-medium">{text}</p>
      )}
    </div>
  )
}

// 内联加载指示器
export function InlineLoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-gray-300 border-t-ai-primary rounded-full animate-spin"></div>
      <span className="text-text-secondary text-sm">加载中...</span>
    </div>
  )
}

// 骨架屏加载器
export function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="card animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-2 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )
      
      default:
        return (
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        )
    }
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}