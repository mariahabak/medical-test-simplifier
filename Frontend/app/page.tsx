"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadState {
  status: "idle" | "uploading" | "success" | "error"
  summary?: string
  error?: string
  fileName?: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const isValidFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
    return validTypes.includes(file.type)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadState({ status: "uploading", fileName: file.name })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:8000/api/simplify", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      setUploadState({
        status: "success",
        summary: data.summary,
        fileName: file.name,
      })
    } catch (error) {
      setUploadState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to process the file",
        fileName: file.name,
      })
    }
  }

  const handleReset = () => {
    setFile(null)
    setUploadState({ status: "idle" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/80 to-teal-500/80 backdrop-blur-xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_25%,rgba(68,68,68,.2)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.2)_75%,rgba(68,68,68,.2))] bg-[length:60px_60px]"></div>
              </div>
              <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                  Medical Test
                  <br />
                  Result Simplifier
                </h1>
                <p className="text-indigo-100 text-lg max-w-md mx-auto">
                  Upload your lab report and get clear, easy-to-understand explanations
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 space-y-6">
              {uploadState.status === "idle" || uploadState.status === "uploading" ? (
                <>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                      isDragging
                        ? "border-teal-400 bg-teal-500/20 scale-105"
                        : "border-white/30 bg-white/5 hover:bg-white/10 hover:border-indigo-400"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/10 to-teal-500/10"></div>
                    <div className="relative">
                      <div
                        className={`inline-block p-4 rounded-xl mb-4 transition-all ${isDragging ? "bg-teal-500/30 scale-110" : "bg-indigo-500/20"}`}
                      >
                        <Upload className={`w-8 h-8 ${isDragging ? "text-teal-300" : "text-indigo-300"}`} />
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">
                        {file ? `✓ ${file.name}` : "Drop your file here"}
                      </p>
                      <p className="text-sm text-white/60">or click to browse PDF or images</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploadState.status === "uploading"}
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    size="lg"
                  >
                    {uploadState.status === "uploading" ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing your report...
                      </>
                    ) : (
                      <>
                        Simplify Results
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </>
              ) : null}

              {uploadState.status === "success" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="p-2 bg-emerald-500/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <p className="text-sm font-medium text-emerald-100">Report analyzed successfully</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Easy-to-Read Summary</h3>
                    <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                        {uploadState.summary}
                      </pre>
                    </div>
                  </div>

                  <Button
                    onClick={handleReset}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-all"
                    size="lg"
                  >
                    Analyze Another Report
                  </Button>
                </div>
              )}

              {uploadState.status === "error" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 p-4 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-200">Error processing file</p>
                      <p className="text-sm text-red-100 mt-1">{uploadState.error}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleReset}
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white font-semibold py-3 rounded-xl"
                    size="lg"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-xs text-amber-100 leading-relaxed">
                  <span className="font-semibold">⚠️ Medical Disclaimer:</span> This tool provides general information
                  only. Always consult a qualified healthcare professional for proper medical interpretation and advice.
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-8 text-center">
            <p className="text-sm text-white/60">Built to make medical information more accessible</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
