// components/FileUpload.tsx
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { ChangeEvent } from "react"

interface FileUploadProps {
  id: string
  label: string
  previewUrl?: string
  filePreview?: { file: File; preview: string }
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function FileUpload({
  id,
  label,
  previewUrl,
  filePreview,
  onFileChange,
  onRemove,
}: FileUploadProps) {
  console.log(filePreview)
  console.log(previewUrl)
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <div className="border rounded p-2 w-32 h-32 flex items-center justify-center">
          {filePreview ? (
            <img
              src={filePreview.preview}
              alt={`${label} Preview`}
              className="w-full h-full object-contain"
            />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <QrCode className="h-12 w-12 mb-2" />
              <span className="text-xs text-center">No QR Code</span>
            </div>
          )}
        </div>
        <div>
          <input
            type="file"
            id={id}
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => document.getElementById(id)?.click()}
          >
            {filePreview ? 'Change' : 'Upload New'}
          </Button>
          {(filePreview || previewUrl) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 ml-2"
              type="button"
              onClick={onRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}