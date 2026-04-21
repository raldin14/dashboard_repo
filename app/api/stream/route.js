import { eventBus } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected ping
      controller.enqueue(new TextEncoder().encode('data: {"type": "connected"}\n\n'))

      const listener = (audit) => {
        const data = JSON.stringify(audit)
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
      }

      eventBus.on('update', listener)

      req.signal.addEventListener('abort', () => {
        eventBus.off('update', listener)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
