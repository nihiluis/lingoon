import { createWorker } from "mediasoup"
import { WorkerInfo } from "../types"
import config from "../config"

export default async function startMediasoup() {
  const workers: WorkerInfo[] = []
  const { numWorkers } = config.mediasoup

  for (let i = 0; i < numWorkers; i++) {
    const worker = await createWorker({
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    })

    worker.on("died", () => {
      console.error(
        "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
        worker.pid
      )
      setTimeout(() => process.exit(1), 2000)
    })

    const mediaCodecs = config.mediasoup.router.mediaCodecs
    const router = await worker.createRouter({ mediaCodecs })

    workers.push({ worker, router })
  }

  return workers
}
