import { useRef, useState } from 'react'
import { API_URL } from '../../api'

type RecordingState = 'idle' | 'recording' | 'sending' | 'success' | 'error'

const STATE_LABELS: Record<RecordingState, string> = {
  idle: 'Hold to record',
  recording: 'Recording…',
  sending: 'Sending…',
  success: 'Sent!',
  error: 'Failed — try again',
}

export default function Mic() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<RecordingState>('idle')

  const startRecording = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setState('sending')
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const form = new FormData()
          form.append('audio', blob, 'recording.webm')
          const token = localStorage.getItem('token')

          const res = await fetch(`${API_URL}/voice`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: form,
          })

          if (!res.ok) throw new Error(`Server error: ${res.status}`)

          setState('success')
        } catch {
          setState('error')
        } finally {
          streamRef.current?.getTracks().forEach((t) => t.stop())
          setTimeout(() => setState('idle'), 2200)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setState('recording')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2200)
    }
  }

  const stopRecording = () => {
    if (state !== 'recording') return
    mediaRecorderRef.current?.stop()
  }

  const isRecording = state === 'recording'
  const isSending = state === 'sending'

  return (
    <>
      <div className="mic-root">
        <div className="mic-btn-wrap" data-recording={String(isRecording)}>
          <div className="mic-ring mic-ring-1" />
          <div className="mic-ring mic-ring-2" />
          <div className="mic-ring mic-ring-3" />

          <button
            className="mic-btn"
            data-state={state}
            onPointerDown={state === 'idle' ? startRecording : undefined}
            onPointerUp={stopRecording}
            onPointerLeave={isRecording ? stopRecording : undefined}
            disabled={isSending}
            aria-label={STATE_LABELS[state]}
          >
            {state === 'sending' && <div className="mic-spinner" />}

            {state === 'success' && (
              <svg className="mic-check" viewBox="0 0 24 24">
                <polyline points="5 13 9 17 19 7" />
              </svg>
            )}

            {(state === 'idle' ||
              state === 'recording' ||
              state === 'error') && (
              <svg
                className="mic-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            )}
          </button>
        </div>

        {/* Waveform animation */}
        <div className="mic-wave" data-recording={String(isRecording)}>
          {[...Array(7)].map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <span className="mic-label" data-state={state}>
          {STATE_LABELS[state]}
        </span>
      </div>
    </>
  )
}
