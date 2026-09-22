"use client";

import { useState } from "react";

export default function MemberAIFloater() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ==================================================
          CLOSED AI BUTTON
      ================================================== */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open CascadEffects AI Assistant"
          className="
            fixed bottom-5 right-5 z-50
            inline-flex items-center gap-2
            rounded-full
            border border-[#B4C2D1]/70
            bg-[#082550]
            px-4 py-3
            text-xs font-black uppercase tracking-wide
            text-white
            shadow-lg
            transition-all
            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          <span
            className="
              flex h-7 w-7 items-center justify-center
              rounded-full
              bg-[#E26D5C]
              text-sm
            "
          >
            ✨
          </span>

          AI Assistant
        </button>
      )}

      {/* ==================================================
          EXPANDED AI DIALOG
      ================================================== */}

      {isOpen && (
        <div
          className="
            fixed bottom-5 right-5 z-50
            w-[320px] max-w-[calc(100vw-2rem)]
            overflow-hidden
            rounded-2xl
            border border-[#B4C2D1]/70
            bg-white
            shadow-2xl
          "
        >
          {/* HEADER */}

          <div className="bg-[#082550] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-[#E26D5C]
                    text-sm
                  "
                >
                  ✨
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/65">
                    CASCADEFFECTS
                  </p>

                  <h2 className="mt-0.5 text-sm font-black uppercase text-white">
                    AI Assistant
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
                className="
                  text-lg leading-none
                  text-white/60
                  transition-colors
                  hover:text-white
                "
              >
                ×
              </button>
            </div>
          </div>

          {/* BODY */}

          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E26D5C]">
              YOUR PERFORMANCE ASSISTANT
            </p>

            <h3 className="mt-2 text-lg font-black uppercase text-[#082550]">
              Coming Soon
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#272D2C]/65">
              CascadEffects AI will eventually help you understand your
              objectives, Key Results, progress, and performance.
            </p>

            <div
              className="
                mt-5
                rounded-lg
                border border-dashed border-[#B4C2D1]
                bg-[#F7F9FB]
                p-4
              "
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#082550]">
                AI PREVIEW
              </p>

              <p className="mt-1 text-xs leading-5 text-[#272D2C]/55">
                The AI Assistant is currently being prepared and is not
                connected to an AI service.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}