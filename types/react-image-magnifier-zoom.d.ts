declare module 'react-image-magnifier-zoom' {
  import { ReactNode, CSSProperties } from 'react'

  export interface ImageMagnifierProps {
    src: string
    width?: number
    height?: number
    magnifierSize?: number
    zoomLevel?: number
    enabled?: boolean
    className?: string
    style?: CSSProperties
    children?: ReactNode
  }

  const ImageMagnifier: React.FC<ImageMagnifierProps>
  export default ImageMagnifier
} 