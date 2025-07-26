"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const banners = [
  {
    id: 1,
    title: "Flash Sale - Up to 70% Off",
    description: "Limited time offer on electronics and gadgets",
    image: "/images/hero-carousel.jpg",
    link: "/flash-sale",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Discover the latest products from top brands",
    image: "/images/hero-carousel1.jpg",
    link: "/new-arrivals",
    buttonText: "Explore",
  },
  {
    id: 3,
    title: "Free Shipping",
    description: "Free shipping on orders over $50",
    image: "/images/hero-carousel2.jpg",
    link: "/shipping",
    buttonText: "Learn More",
  },
  // {
  //   id: 4,
  //   title: "Find below 50",
  //   description: "Find items below $50",
  //   image: "/images/hero-carousel3.jpg",
  //   link: "/shipping",
  //   buttonText: "Learn More",
  // },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            transform: `translateX(${(index - currentSlide) * 100}%)`,
          }}
        >
          <div className="relative h-full">
            <Image
              src={banner.image || "/placeholder.svg"}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* <div className="absolute inset-0 bg-black bg-opacity-10" /> */}
            {/* <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                  <p className="text-lg md:text-xl mb-8 opacity-90">{banner.description}</p>
                  <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-black font-semibold" asChild>
                    <Link href={banner.link}>{banner.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
