"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type React from "react"

export default function ImageUploader() {
  const [userImage, setUserImage] = useState<string | null>(null)
  const [mergedImage, setMergedImage] = useState<{ dataUrl: string; overlayType: string } | null>(null)
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)
  const [badgePosition, setBadgePosition] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target?.result as string)
        setBadgePosition(null) // Reset badge position when new image is uploaded
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReplaceImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUserImage(e.target?.result as string)
          setMergedImage(null)
          setSelectedOverlay(null)
          setBadgePosition(null)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedOverlay) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    setBadgePosition({ x, y })
  }

  const handleMerge = () => {
    if (userImage && canvasRef.current && selectedOverlay && badgePosition) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          // Draw user image (circular)
          ctx.save()
          ctx.beginPath()
          ctx.arc(200, 200, 200, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, 0, 0, 400, 400)
          ctx.restore()

          // Load and draw selected overlay
          const overlayImg = new Image()
          overlayImg.onload = () => {
            // Scale down and position the badge
            const badgeSize = 65
            const badgeX = badgePosition.x - badgeSize / 2
            const badgeY = badgePosition.y - badgeSize / 2
            ctx.drawImage(overlayImg, badgeX, badgeY, badgeSize, badgeSize)
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
    setBadgePosition(null)
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

          // Create circular clipping path
          ctx.beginPath()
          ctx.arc(200, 200, 200, 0, Math.PI * 2)
          ctx.clip()

          ctx.drawImage(img, (400 - scaledWidth) / 2, (400 - scaledHeight) / 2, scaledWidth, scaledHeight)

          // Draw badge if position is set
          if (selectedOverlay && badgePosition) {
            const badgeImg = new Image()
            badgeImg.onload = () => {
              const badgeSize = 65
              ctx.drawImage(
                badgeImg,
                badgePosition.x - badgeSize / 2,
                badgePosition.y - badgeSize / 2,
                badgeSize,
                badgeSize,
              )
            }
            badgeImg.src = `/${selectedOverlay}_badge.png`
          }
        }
        img.src = userImage
      }
    }
  }, [userImage, selectedOverlay, badgePosition])

  return (
    <div className="w-full mx-auto p-4">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
      <label
        htmlFor="image-upload"
        className="block w-full max-w-md aspect-square relative mx-auto mb-4"
        onClick={(e) => {
          if (userImage) {
            e.preventDefault()
          }
        }}
      >
        <div className="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors relative bg-gray-900/30 rounded-full overflow-hidden">
          {!userImage ? (
            <>
              <span className="text-gray-400 text-lg text-center px-4">Add your X/Twitter Profile Picture Here</span>
              <span className="text-gray-500 text-sm mt-2 text-center px-4">Click to upload</span>
            </>
          ) : (
            <div
              className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" onClick={handleCanvasClick} />
            </div>
          )}
        </div>
      </label>
      {userImage && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleReplaceImage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-full"
          >
            Replace Image
          </Button>
        </div>
      )}
      {userImage && (
        <button
          onClick={(e) => {
            e.preventDefault()
            handleReplaceImage()
          }}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}
      {userImage && !mergedImage && (
        <div className="mt-4 text-center">
          <div className="bg-black bg-opacity-50 p-2 rounded mb-2">
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
            <p className="text-white mt-2 mb-2">Click anywhere on your image to place badge</p>
          </div>
          {selectedOverlay && (
            <>
              {/* <p className="text-white mb-2">Click on the image to position the badge</p> */}
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleMerge()
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 text-sm"
                disabled={!badgePosition}
              >
                MERGE
              </Button>
            </>
          )}
        </div>
      )}
      {mergedImage && (
        <div className="mt-4 flex flex-col items-center">
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
    </div>
  )
}

