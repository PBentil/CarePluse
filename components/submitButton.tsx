"use client"

import React from "react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"

interface SubmitButtonProps {
  isLoading?: boolean
  className?: string
  loadingText?: string
  children: React.ReactNode
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
                                                            isLoading = false,
                                                            className,
                                                            loadingText = "Loading...",
                                                            children,
                                                          }) => {
  return (
      <Button
          type="submit"
          disabled={isLoading}
          className={className || "shad-primary-btn w-full flex items-center justify-center gap-2"}
      >
        {isLoading ? (
            <>
              <Spinner /> {loadingText}
            </>
        ) : (
            children
        )}
      </Button>
  )
}