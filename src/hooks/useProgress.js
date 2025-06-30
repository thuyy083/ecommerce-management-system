import { useState, useEffect } from 'react'

const useProgress = (isLoading = false) => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const isFakeLoading = isLoading === undefined

  useEffect(() => {
    if (isFakeLoading) {
      setProgress(0)
      const timeout = setTimeout(() => {
        setProgress(100)
        setIsVisible(false) // Ẩn sau khi chạy xong
      }, 1000)

      return () => clearTimeout(timeout)
    }

    if (isLoading) {
      setIsVisible(true) // Hiển thị thanh tiến trình khi bắt đầu
      const interval = setInterval(() => {
        setProgress((oldProgress) => (oldProgress >= 90 ? oldProgress : oldProgress + 5))
      }, 300)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
      setTimeout(() => setIsVisible(false), 500) // Ẩn sau khi hoàn thành
    }
  }, [isFakeLoading, isLoading])

  return { progress, isVisible }
}

export default useProgress