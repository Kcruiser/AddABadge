"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type React from "react"

export default function ImageUploader() {
  const [userImage, setUserImage] = useState<string | null>(null)
  const [mergedImage, setMergedImage] = useState<{ dataUrl: string; overlayType: string } | null>(null)
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMerge = () => {
    if (userImage && canvasRef.current && selectedOverlay) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          // Draw user image
          ctx.drawImage(img, 0, 0, 400, 400)

          // Load and draw selected overlay
          const overlayImg = new Image()
          overlayImg.onload = () => {
            ctx.drawImage(overlayImg, 0, 0, 400, 400)
            setMergedImage({
              dataUrl: canvas.toDataURL(),
              overlayType: selectedOverlay,
            })
          }
          overlayImg.src = `/${selectedOverlay}_badge.png`
        }
        img.src = userImage
      }
    }
  }

  const handleChangeOverlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setMergedImage(null)
    setSelectedOverlay(null)
  }

  useEffect(() => {
    if (userImage && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          // Check image dimensions
          if (img.width < 400 || img.height < 400) {
            alert("Image must be at least 400x400 pixels")
            setUserImage(null)
            return
          }

          // Calculate scaling factor
          const scale = Math.min(400 / img.width, 400 / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale

          // Clear canvas and draw scaled image centered
          ctx.clearRect(0, 0, 400, 400)
          ctx.drawImage(img, (400 - scaledWidth) / 2, (400 - scaledHeight) / 2, scaledWidth, scaledHeight)
        }
        img.src = userImage
      }
    }
  }, [userImage])

  return (
    <div className="w-full max-w-md mx-auto">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
      <label htmlFor="image-upload" className="block w-full aspect-square relative mx-auto">
        <div className="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors relative bg-gray-900/30">
          {!userImage ? (
            <>
              <span className="text-gray-400 text-lg text-center px-4">Add your X/Twitter Profile Picture Here</span>
              <span className="text-gray-500 text-sm mt-2 text-center px-4">Then Click [MERGE]</span>
            </>
          ) : (
            <>
              <canvas ref={canvasRef} width={400} height={400} className="absolute inset-0 w-full h-full" />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setUserImage(null)
                  setMergedImage(null)
                  setSelectedOverlay(null)
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>
        {userImage && !mergedImage && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full text-center">
            <div className="bg-black bg-opacity-50 p-2 rounded">
              <p className="text-white mb-2 font-semibold text-shadow">Which Badge Would You Like?</p>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => setSelectedOverlay("hex")}
                  className={`px-2 py-1 text-sm ${selectedOverlay === "hex" ? "bg-orange-500" : "bg-gray-500"}`}
                >
                  HEX
                </Button>
                <Button
                  onClick={() => setSelectedOverlay("pulse")}
                  className={`px-2 py-1 text-sm ${selectedOverlay === "pulse" ? "bg-orange-500" : "bg-gray-500"}`}
                >
                  Pulse
                </Button>
                <Button
                  onClick={() => setSelectedOverlay("both")}
                  className={`px-2 py-1 text-sm ${selectedOverlay === "both" ? "bg-orange-500" : "bg-gray-500"}`}
                >
                  Both
                </Button>
              </div>
            </div>
            {selectedOverlay && (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleMerge()
                }}
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 text-sm"
              >
                MERGE
              </Button>
            )}
          </div>
        )}
        {mergedImage && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
            <a
              href={mergedImage.dataUrl}
              download={`${mergedImage.overlayType.charAt(0).toUpperCase() + mergedImage.overlayType.slice(1)}_badge.png`}
              className="mb-2"
            >
              <Button className="text-sm px-4 py-1">
                Download {mergedImage.overlayType.charAt(0).toUpperCase() + mergedImage.overlayType.slice(1)} Badge
              </Button>
            </a>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleChangeOverlay(e)
              }}
              className="text-sm px-4 py-1 bg-gray-500 hover:bg-gray-600"
            >
              Change Overlay
            </Button>
          </div>
        )}
      </label>
    </div>
  )
}

