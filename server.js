import "dotenv/config";
import express from "express";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY in .env");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const VOICE_ID = "BijSH9BdCr6Rjvve6ObU";
const MODEL_ID = "eleven_v3";

const script = [
  ["NIGHT FM — 2:19 AM",
   "Xin chào… bạn đang nghe NIGHT FM, tần số 98.7 MHz."],
  ["BẢN TIN ĐÊM",
   "Hiện tại là 2 giờ 19 phút sáng."],
  ["TIN KHẨN",
   "Một người vẫn đang online… và người đó vẫn chưa chịu đi ngủ."],
  ["BỘ PHẬN KỸ THUẬT",
   "Chúng tôi đã kiểm tra. Não vẫn đang hoạt động bình thường. Tình hình khá nghiêm trọng."],
  ["CHƯƠNG TRÌNH ĐẶC BIỆT",
   "Vì vậy, NIGHT FM xin phép chuyển sang chương trình: Đêm Nay Ngủ Ngoan."],
  ["LỜI NHẮN",
   "Không cần nghĩ gì nữa. Không cần check điện thoại thêm."],
  ["",
   "Cứ nằm xuống… kéo chăn lên… nhắm mắt lại…"],
  ["",
   "Và để phần còn lại cho ngày mai."],
  ["NIGHT FM",
   "Cảm ơn bạn đã ở lại với NIGHT FM tối nay."],
  ["BẢN TIN CUỐI",
   "Chúc bạn có một đêm thật yên. Ngủ thật ngon."],
  ["",
   "Và… đừng thức thêm nữa."]
];

app.use(express.static("."));

app.get("/api/script", (_req, res) => {
  res.json(script.map(([title, text]) => ({ title, text })));
});

app.get("/api/tts/:index", async (req, res) => {
  try {
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || !script[index]) {
      return res.status(404).json({ error: "Invalid script index" });
    }

    const [, text] = script[index];

    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text,
      modelId: MODEL_ID,
      languageCode: "vi",
      outputFormat: "mp3_44100_128"
    });

    const chunks = [];
    for await (const chunk of audio) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ElevenLabs TTS failed" });
  }
});

app.listen(port, () => {
  console.log(`NIGHT FM running at http://localhost:${port}`);
});
