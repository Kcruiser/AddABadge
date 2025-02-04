"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Poppins } from "next/font/google"
import ImageUploader from "./image-uploader"

const poppins = Poppins({ weight: ["700"], subsets: ["latin"] })

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 150

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 0.5
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.color = Math.random() < 0.8 ? this.getRandomOrangeShade() : this.getRandomCoolShade()
      }

      getRandomOrangeShade() {
        const hue = Math.floor(Math.random() * 31) + 20
        const saturation = Math.floor(Math.random() * 21) + 80
        const lightness = Math.floor(Math.random() * 21) + 50
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }

      getRandomCoolShade() {
        const hue = Math.floor(Math.random() * 90) + 180 // Range from blue to pink
        const saturation = Math.floor(Math.random() * 21) + 80
        const lightness = Math.floor(Math.random() * 21) + 50
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        ctx.shadowBlur = 15
        ctx.shadowColor = this.color
        ctx.globalCompositeOperation = "lighter"
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = "source-over"

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-black" />
      <div className="relative z-10 flex flex-col items-center justify-start px-4 py-8 flex-grow">
        <motion.h1
          className={`mb-4 text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl ${poppins.className} text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Add A Badge
        </motion.h1>
        <motion.p
          className="max-w-[600px] text-base text-gray-400 sm:text-lg mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          No Gatekeeping Allowed
        </motion.p>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <ImageUploader />
        </motion.div>
      </div>
    </div>
  )
}

