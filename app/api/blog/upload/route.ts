// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveToGridFS } from "@/lib/gridfs";
import * as Busboy from "busboy";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // we handle parsing manually
  },
};

// Helper: convert Web ReadableStream to Node.js Readable
function readableStreamToNodeReadable(
  stream: ReadableStream<Uint8Array>
): Readable {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.destroy(error);
        } else {
          this.destroy(new Error(String(error)));
        }
      }
    },
  });
}

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>(async (resolve, reject) => {
    try {
      const busboy = new Busboy({ headers: Object.fromEntries(req.headers) });

      let fileBuffer: Buffer | null = null;
      let filename = "";

      busboy.on(
        "file",
        (
          _fieldname: string, // prefix with _ to mark unused param
          file: NodeJS.ReadableStream,
          info: { filename: string; encoding: string; mimeType: string }
        ) => {
          filename = info.filename;

          const chunks: Buffer[] = [];
          file.on("data", (data: Buffer) => {
            chunks.push(data);
          });
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        }
      );

      busboy.on("finish", async () => {
        if (!fileBuffer) {
          return resolve(
            NextResponse.json({ error: "No file uploaded" }, { status: 400 })
          );
        }

        try {
          const id = await saveToGridFS(fileBuffer, filename);

          // id might be ObjectId or string, convert to string safely
          return resolve(
            NextResponse.json({ message: "File uploaded", id: String(id) })
          );
        } catch (error) {
          console.error("GridFS upload error:", error);
          return resolve(
            NextResponse.json(
              { error: "Failed to upload to GridFS" },
              { status: 500 }
            )
          );
        }
      });

      // Convert NextRequest body (Web stream) to Node.js stream for busboy
      const nodeStream = readableStreamToNodeReadable(req.body!);
      nodeStream.pipe(busboy);
    } catch (error) {
      console.error("Upload handler error:", error);
      reject(NextResponse.json({ error: "Server error" }, { status: 500 }));
    }
  });
}
