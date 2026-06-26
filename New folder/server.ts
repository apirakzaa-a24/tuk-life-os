import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK with named parameters & telemetry headers
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

function getMockParsingResult(type: string) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  switch (type) {
    case "receipt":
      return {
        subject: "Central Food Hall Grocery Shopping",
        main_category: "FINANCE",
        details: "Purchased premium organic vegetables, ribeye steak, mineral water, and dish soap. Paid with SCB Credit Card.",
        amount_value: 1240.50,
        unit: "THB",
        tags: ["#groceries", "#finance", "#food"],
        secondary_keys: {
          ref_transaction_id: `FIN-TXN-${dateStr}-01A3`,
          ref_vehicle_id: "",
          recipient: "Central Food Hall Chidlom"
        }
      };
    case "medical":
      return {
        subject: "Routine Dental Scaling and Checkup",
        main_category: "MEDICAL",
        details: "Completed routine scaling, polishing, and examination. No cavities found. Dentist recommended next checkup in 6 months.",
        amount_value: 1500.00,
        unit: "THB",
        tags: ["#dental", "#medical", "#checkout"],
        secondary_keys: {
          ref_transaction_id: `FIN-TXN-${dateStr}-02B4`,
          ref_vehicle_id: "",
          recipient: "Dental Care Clinic Sathon"
        }
      };
    case "vehicle":
      return {
        subject: "Toyota Prius 120,000 km Scheduled Service",
        main_category: "GARAGE",
        details: "Replaced engine oil, oil filter, cabin air filter, and brake fluid. Completed hybrid system health check (Excellent status).",
        amount_value: 5840.00,
        unit: "THB",
        tags: ["#garage", "#prius", "#maintenance"],
        secondary_keys: {
          ref_transaction_id: `FIN-TXN-${dateStr}-03C9`,
          ref_vehicle_id: "GAR-VEH-01",
          recipient: "Toyota Buzz Sathon"
        }
      };
    case "food":
      return {
        subject: "Lunch: Grilled Salmon with Quinoa & Water",
        main_category: "HEALTH",
        details: "Grilled Atlantic salmon fillet (150g) served with red organic quinoa, baby spinach, cherry tomatoes, and cold olive oil dressing.",
        amount_value: 480.00,
        unit: "KCAL",
        tags: ["#diet", "#health", "#nutrition", "#lunch"],
        secondary_keys: {
          ref_transaction_id: "",
          ref_vehicle_id: "",
          recipient: "Homemade"
        }
      };
    default:
      return {
        subject: "Scanned Log Ingestion",
        main_category: "MASTER",
        details: "General documentation ledger text successfully extracted.",
        amount_value: 1.0,
        unit: "COUNT",
        tags: ["#document", "#sync"],
        secondary_keys: {
          ref_transaction_id: "",
          ref_vehicle_id: "",
          recipient: ""
        }
      };
  }
}

// API Endpoint for Gemini Vision Parsing (OCR/Ingestion)
app.post("/api/gemini/parse", async (req, res) => {
  try {
    const { imageBase64, mimeType, type } = req.body;
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing imageBase64 or mimeType" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return a fully schema-compliant fallback result if key is absent from environment variables
      return res.json({
        mocked: true,
        data: {
          category: "FINANCE",
          display_category: "การเงิน",
          title: "Central Food Hall Grocery Shopping",
          summary: "บันทึกการซื้อของใช้และวัตถุดิบทำอาหารที่ Central Food Hall",
          details: "สแกนของใช้และวัตถุดิบทำอาหารที่ Central Food Hall (รายการชำระเงินจำลองเนื่องจากไม่ได้ตั้งค่า API Key)",
          confidence: "High",
          confidence_percentage: 99,
          suggested_tags: ["groceries", "finance", "food"],
          estimated_values: {
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            weight: null,
            blood_pressure: null,
            blood_sugar: null,
            merchant: "Central Food Hall Chidlom",
            price: "1,240.50 THB",
            payment_method: "บัตรเครดิต"
          }
        }
      });
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64
      }
    };

    const systemPrompt = `You are a professional Life Event Understanding AI agent for TUK LIFE OS.
Your objective is to analyze the uploaded image and determine: "What life event should be recorded in the user's life from this image?"
Do NOT act as an Image Caption or Image Description tool. Do NOT just list the items visible in the image.

STRICT INSTRUCTIONS FOR THE EVENT ANALYSIS:
1. Identify the EVENT TYPE (category and display_category):
   Choose from:
   - "อาหาร" (Main Category: HEALTH)
   - "สุขภาพ" (Main Category: HEALTH)
   - "การเงิน" (Main Category: FINANCE)
   - "การเดินทาง" (Main Category: TRAVEL)
   - "การออกกำลังกาย" (Main Category: HEALTH)
   - "การทำงาน" (Main Category: WORK)
   - "การช้อปปิ้ง" (Main Category: SHOPPING)
   - "เอกสาร" (Main Category: OTHER)
   - "รถยนต์" (Main Category: GARAGE)
   - "บ้าน" (Main Category: HOME)
   - "อื่นๆ" (Main Category: OTHER)

2. Create a human-like summary (Summary แบบภาษามนุษย์) in Thai for the "summary" field.
   Examples:
   - BAD: "พบข้าวมันไก่และแตงกวาในจาน"
   - GOOD: "บันทึกการรับประทานข้าวมันไก่ 1 จาน"
   - BAD: "ภาพใบเสร็จปั๊มน้ำมัน Caltex 800 บาท"
   - GOOD: "บันทึกการเติมน้ำมันรถยนต์ที่ปั๊ม Caltex ยอด 800 บาท"

3. Extract useful values for estimated_values:
   - For Food ("อาหาร" / HEALTH):
     * title: "ข้าวมันไก่", "ผัดซีอิ๊ว", "ข้าวกะเพรา", "ข้าวผัด", "ก๋วยเตี๋ยว", "ส้มตำ", "ข้าวหมูแดง", "ข้าวขาหมู", "ข้าวไข่เจียว" or other common Thai dishes when recognizable. Fallback: "อาหารจานเดียว"
     * calories: e.g., "650 kcal (ประมาณ)" or estimated based on common food knowledge.
     * protein: e.g., "30 g" or estimated.
     * carbs: e.g., "70 g" or estimated.
     * fat: e.g., "20 g" or estimated.
   - For Finance ("การเงิน" / FINANCE):
     * merchant: e.g. "Caltex", "Starbucks", or store name if visible, otherwise null.
     * price: The numeric total + currency if visible, e.g., "800.00 THB", otherwise EXACTLY "ไม่สามารถระบุราคาได้จากภาพ".
     * payment_method: "เงินสด", "บัตรเครดิต", "โอนเงิน", or "ไม่สามารถระบุได้จากภาพ".
   - For Health ("สุขภาพ" / HEALTH):
     * weight: weight value if visible (e.g., "72.5 kg"), otherwise null.
     * blood_pressure: blood pressure value if visible, otherwise null.
     * blood_sugar: blood sugar value if visible, otherwise null.

4. STRICT RULE - DO NOT INVENT UNFOUNDED DATA:
   If the price/amount is not visible, price MUST be EXACTLY "ไม่สามารถระบุราคาได้จากภาพ". Never use random or guessed numbers.

5. Return a highly polished, fully structured JSON matching the requested responseSchema. Always output in Thai first for titles, summaries, and details.`;

    const promptText = `Analyze this image as a Life Event of the user. Determine category, title, summary, details, confidence score, suggested tags, and estimated values. Do not make up facts. Make sure to estimate nutrition macros (calories, protein, carbs, fat) if the event is a food item/meal.`;

    let responseText = "";
    let attempts = 0;
    const maxAttempts = 5;
    let errorToThrow: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const currentModel = modelsToTry[Math.min(attempts - 1, modelsToTry.length - 1)];
        console.log(`[Gemini API Parse] Attempting parsing with model: ${currentModel} (Attempt ${attempts}/${maxAttempts})`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: [imagePart, promptText],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: "Category of event: HEALTH, FINANCE, GARAGE, WORK, TRAVEL, SHOPPING, HOME, OTHER." },
                display_category: { type: Type.STRING, description: "Must be exactly one of: 'อาหาร', 'สุขภาพ', 'การเงิน', 'การเดินทาง', 'การออกกำลังกาย', 'การทำงาน', 'การช้อปปิ้ง', 'เอกสาร', 'รถยนต์', 'บ้าน', 'อื่นๆ'." },
                title: { type: Type.STRING, description: "Thai title of the event (e.g., 'ข้าวมันไก่', 'เติมน้ำมันรถยนต์', 'ตรวจสุขภาพ')." },
                summary: { type: Type.STRING, description: "Thai human-friendly life event summary (e.g., 'บันทึกการรับประทานข้าวมันไก่ 1 จาน')." },
                details: { type: Type.STRING, description: "Factual description/analysis of the event seen in the image." },
                confidence: { type: Type.STRING, description: "Confidence: 'high', 'medium', or 'low'." },
                confidence_percentage: { type: Type.NUMBER, description: "Confidence percentage score e.g. 95." },
                suggested_tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of hashtag keywords." },
                estimated_values: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.STRING, description: "Calories (e.g., '650 kcal (ประมาณ)') or null." },
                    protein: { type: Type.STRING, description: "Protein (e.g., '30 g') or null." },
                    carbs: { type: Type.STRING, description: "Carbohydrates (e.g., '70 g') or null." },
                    fat: { type: Type.STRING, description: "Fat (e.g., '20 g') or null." },
                    weight: { type: Type.STRING, description: "Weight (e.g., '72.5 kg') or null." },
                    blood_pressure: { type: Type.STRING, description: "Blood pressure or null." },
                    blood_sugar: { type: Type.STRING, description: "Blood sugar or null." },
                    merchant: { type: Type.STRING, description: "Merchant name or null." },
                    price: { type: Type.STRING, description: "Price or 'ไม่สามารถระบุราคาได้จากภาพ'." },
                    payment_method: { type: Type.STRING, description: "Payment method or 'ไม่สามารถระบุได้จากภาพ'." }
                  }
                }
              },
              required: ["category", "display_category", "title", "summary", "details", "confidence", "confidence_percentage", "suggested_tags", "estimated_values"]
            }
          }
        });

        const text = response.text;
        if (text) {
          responseText = text;
          errorToThrow = null;
          break;
        } else {
          throw new Error("Empty response returned from Gemini API model.");
        }
      } catch (err: any) {
        console.warn(`[Gemini API Parse] Attempt ${attempts}/${maxAttempts} failed: ${err.message || err}`);
        errorToThrow = err;
        
        // Fail fast on quota / rate limit errors to avoid long blocking periods
        const isQuota = (err.message || String(err)).includes("429") || 
                        (err.message || String(err)).toUpperCase().includes("QUOTA") || 
                        (err.message || String(err)).toUpperCase().includes("LIMIT") || 
                        (err.message || String(err)).toUpperCase().includes("RESOURCE_EXHAUSTED");
        if (isQuota) {
          console.warn("[Gemini API Parse] Quota limit exceeded. Skipping remaining retries.");
          break;
        }

        if (attempts < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s...
          const delay = 1000 * Math.pow(2, attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (errorToThrow) {
      throw errorToThrow;
    }

    const parsedJson = JSON.parse(responseText.trim());

    return res.json({ mocked: false, data: parsedJson });

  } catch (error: any) {
    const errMsg = error.message || String(error);
    let errorType = "API Error";
    if (errMsg.includes("429") || errMsg.toUpperCase().includes("QUOTA") || errMsg.toUpperCase().includes("LIMIT") || errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED")) {
      errorType = "Quota Error";
    } else if (errMsg.toLowerCase().includes("timeout") || errMsg.toLowerCase().includes("deadline") || errMsg.toLowerCase().includes("etimedout")) {
      errorType = "Timeout Error";
    }

    console.error(`[${errorType}] Gemini Ingestion Parse Failed:`, errMsg);

    return res.status(200).json({
      success: false,
      status: "api_failed",
      errorType,
      message: "AI ไม่สามารถวิเคราะห์ภาพได้ในขณะนี้ (Quota หรือ API Error)",
      rawError: errMsg
    });
  }
});

// API Endpoint for Gemini Text Translation
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Missing text or targetLanguage" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ translatedText: text }); // Fallback to original
    }

    const prompt = `Translate the following text to ${targetLanguage === 'th' ? 'Thai' : 'English'}. If the text is already in the target language or if it is a proper noun/code that should not be translated, return it as is. Return ONLY the translated text without any explanation or quotes.
    
    Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const translatedText = response.text?.trim() || text;
    return res.json({ translatedText });
  } catch (error: any) {
    console.warn("Translation API Error (handled gracefully):", error.message || error);
    return res.json({ translatedText: req.body.text }); // Fallback
  }
});


// Vite Server Integration for standard preview
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TUK LIFE OS Server] Full-Stack Server Running on http://localhost:${PORT}`);
  });
}

startServer();
