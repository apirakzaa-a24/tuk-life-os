import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, Sparkles, RefreshCw, Check, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeLocalStorage } from '../utils/storage';

interface AiIngestorProps {
  isSimplifiedMode?: boolean;
  customProps?: any;
  onCustomizeScript: (customData: {
    scb_id: string;
    license_plate: string;
    hourly_rate: string;
    weight_kg: string;
  }) => void;
}

export default function AiIngestor({ onCustomizeScript, isSimplifiedMode = false }: AiIngestorProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [reviewData, setReviewData] = useState<any | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>('image/jpeg');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiFailed, setApiFailed] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [scbId, setScbId] = useState<string>('FIN-ACC-SCB-9102');
  const [licensePlate, setLicensePlate] = useState<string>('4กธ-4235 กรุงเทพฯ');
  const [hourlyRate, setHourlyRate] = useState<string>('1500');
  const [weightKg, setWeightKg] = useState<string>('72.5');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [showPopup, setShowPopup] = useState<boolean>(true);

  useEffect(() => {
    if (!uploadedImage) {
      setShowPopup(true);
    }
  }, [uploadedImage]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getSuggestedCategory = (merchant: string, rawCategory: string): string => {
    // 1. Learning System
    const learned = JSON.parse(safeLocalStorage.getItem('tuk_life_ocr_learning') || '{}');
    if (learned[merchant]) return learned[merchant];

    // 2. Rule-based
    const m = merchant.toUpperCase();
    if (['PTT', 'BANGCHAK', 'SHELL'].some(k => m.includes(k))) return 'garage';
    if (['7-ELEVEN', 'LOTUS', 'BIG C', 'MAKRO'].some(k => m.includes(k))) return 'finance';
    if (['AMAZON', 'STARBUCKS', 'CAFE'].some(k => m.includes(k))) return 'finance';
    if (['HOSPITAL', 'CLINIC', 'DENTAL'].some(k => m.includes(k))) return 'health';
    
    return rawCategory.toLowerCase();
  };

  const saveLearnedCategory = (merchant: string, category: string) => {
    const learned = JSON.parse(safeLocalStorage.getItem('tuk_life_ocr_learning') || '{}');
    learned[merchant] = category;
    safeLocalStorage.setItem('tuk_life_ocr_learning', JSON.stringify(learned));
  };

  const getEventEmoji = (displayCategory: string) => {
    switch (displayCategory) {
      case 'อาหาร': return '🍽️';
      case 'สุขภาพ': return '🩺';
      case 'การเงิน': return '💵';
      case 'การเดินทาง': return '🚗';
      case 'การออกกำลังกาย': return '💪';
      case 'การทำงาน': return '💼';
      case 'การช้อปปิ้ง': return '🛍️';
      case 'เอกสาร': return '📄';
      case 'รถยนต์': return '🔧';
      case 'บ้าน': return '🏠';
      default: return '✨';
    }
  };

  const getFormattedTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `วันนี้ ${hh}:${mm}`;
  };

  const dispatchParsedResult = async (data: any) => {
    const webAppUrl = safeLocalStorage.getItem('tuk_life_web_app_url');
    if (!webAppUrl) {
      setToast({
        message: 'Cannot log: Please connect Google Sheets first.',
        type: 'error'
      });
      return;
    }

    setDispatching(true);
    setDispatchStatus(null);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 8);
    const dateOnly = now.toISOString().slice(0, 10);

    let chosenSheet = "MASTER_LOGS_ACTIVE";
    let payloadRow: any = {};

    if (data.main_category === 'FINANCE') {
      chosenSheet = "FIN_TRANSACTIONS_V3";
      payloadRow = {
        transaction_id: data.secondary_keys?.ref_transaction_id || `FIN-TXN-${dateStr}-${randSuffix}`,
        timestamp: timestamp,
        account_source_id: 'FIN-ACC-01',
        account_dest_id: '',
        flow_type: 'EXPENSE',
        amount_thb: parseFloat(data.amount_value || '0').toFixed(2),
        category_code: 'FIN_' + (data.tags?.[0]?.toUpperCase() || 'GENERAL'),
        recipient: data.secondary_keys?.recipient || data.subject,
        invoice_attachment: 'https://drive.google.com/open?id=ai_captured_attachment'
      };
    } else if (data.main_category === 'HEALTH') {
      chosenSheet = "HLT_HEALTH_METRICS_V3";
      payloadRow = {
        metric_id: `HLT-MTR-${dateStr}`,
        date: dateOnly,
        weight_kg: data.unit === 'KG' ? parseFloat(data.amount_value || '72.5').toFixed(1) : '72.5',
        systolic_bp: '120',
        diastolic_bp: '80',
        resting_heart_rate: '65',
        sleep_hours: '8.0',
        sleep_score: '85',
        activity_calories: data.unit === 'KCAL' ? parseInt(data.amount_value || '350').toString() : '350',
        water_ml: '2200',
        notes: `${data.subject}: ${data.details}`
      };
    } else if (data.main_category === 'GARAGE') {
      chosenSheet = "GAR_LOGS_V3";
      payloadRow = {
        garage_log_id: `GAR-LOG-${dateStr}-${randSuffix}`,
        vehicle_id: data.secondary_keys?.ref_vehicle_id || 'GAR-VEH-01',
        log_type: 'MAINTENANCE',
        odometer_km: data.unit === 'KM' ? parseInt(data.amount_value || '124000').toString() : '124000',
        fuel_liters: data.unit === 'L' ? parseFloat(data.amount_value || '35.0').toFixed(2) : '35.0',
        transaction_ref: data.secondary_keys?.ref_transaction_id || '',
        diagnostic_details: `${data.subject}: ${data.details}`
      };
    } else if (data.main_category === 'WORK') {
      chosenSheet = "WRK_TIME_LOGS_V3";
      payloadRow = {
        time_log_id: `WRK-LOG-${dateStr}-${randSuffix}`,
        project_id: 'WRK-PRJ-01',
        timestamp_start: `${dateOnly} 09:00:00`,
        timestamp_end: `${dateOnly} 11:00:00`,
        spent_minutes: data.unit === 'MIN' ? parseInt(data.amount_value || '120').toString() : '120',
        task_details: `${data.subject}: ${data.details}`,
        billing_status: 'UNBILLED'
      };
    } else {
      chosenSheet = "MASTER_LOGS_ACTIVE";
      payloadRow = {
        log_id: `TL-${dateStr}-${randSuffix}`,
        timestamp: timestamp,
        main_category: data.main_category || 'SYSTEM',
        type: data.tags?.[0] || 'GENERAL',
        subject: data.subject,
        details: data.details,
        ref_transaction_id: data.secondary_keys?.ref_transaction_id || '',
        ref_vehicle_id: data.secondary_keys?.ref_vehicle_id || '',
        ref_project_id: '',
        ref_medical_id: '',
        value_result: data.amount_value?.toString() || '',
        unit: data.unit || '',
        tags: '#' + (data.tags || []).join(', #'),
        mood: '2_GOOD'
      };
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'appendRow',
          sheetName: chosenSheet,
          rowData: payloadRow
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP status code ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success') {
        setDispatchStatus(`✓ Successfully sent to ${chosenSheet}!`);
        setToast({
          message: `🎉 Parsed row added successfully to sheet "${chosenSheet}"!`,
          type: 'success'
        });
      } else {
        throw new Error(resJson.message || 'Apps Script returned error.');
      }
    } catch (err: any) {
      console.error(err);
      setDispatchStatus(`⚠️ Send failed: ${err.message || 'Check Web App URL.'}`);
      setToast({
        message: `⚠️ Send Failed: ${err.message || 'Verify your deployed Web App URL.'}`,
        type: 'error'
      });
    } finally {
      setDispatching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploadedMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read local file.");
    };
    reader.readAsDataURL(file);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editableReviewData, setEditableReviewData] = useState<any>(null);

  const handleUseMockPreset = (presetType: string) => {
    let mockParsed: any = null;
    
    if (presetType === 'food') {
      mockParsed = {
        category: "HEALTH",
        display_category: "อาหาร",
        title: "อาหารเที่ยง: ข้าวมันไก่ผสมไก่ทอด",
        summary: "บันทึกการรับประทานข้าวมันไก่ผสม 1 จานใหญ่",
        details: "ภาพอาหารข้าวมันไก่ มีไก่ต้มและไก่ทอด เสิร์ฟพร้อมน้ำซุป น้ำจิ้ม และแตงกวาฝาน พลังงานประมาณ 750 kcal มีโปรตีนสูงจากเนื้ออกไก่",
        confidence: "High",
        confidence_percentage: 95,
        suggested_tags: ["อาหาร", "สุขภาพ", "ข้าวมันไก่", "มื้อเที่ยง"],
        estimated_values: {
          calories: "750 kcal (ประมาณ)",
          protein: "35 g",
          carbs: "80 g",
          fat: "25 g",
          weight: null,
          blood_pressure: null,
          blood_sugar: null,
          merchant: "ร้านข้าวมันไก่เจ๊อ้วน Sathon",
          price: "75.00 THB",
          payment_method: "เงินสด"
        }
      };
    } else if (presetType === 'finance') {
      mockParsed = {
        category: "FINANCE",
        display_category: "การเงิน",
        title: "ช้อปปิ้งของชำ Central Food Hall",
        summary: "บันทึกการซื้อของใช้และวัตถุดิบทำอาหารที่ Central Food Hall",
        details: "สลิปใบเสร็จรายการสินค้า เช่น ผักออร์แกนิก เนื้อวัวพรีเมียม น้ำดื่มบรรจุขวด และสบู่เหลว ยอดชำระเงินรวม 1,240.50 บาท ชำระด้วยบัตรเครดิต",
        confidence: "High",
        confidence_percentage: 99,
        suggested_tags: ["การเงิน", "ช้อปปิ้ง", "ของชำ", "ใบเสร็จ"],
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
      };
    } else if (presetType === 'health') {
      mockParsed = {
        category: "HEALTH",
        display_category: "สุขภาพ",
        title: "ค่าวัดน้ำหนักตัวและความดันโลหิต",
        summary: "บันทึกน้ำหนักตัวและสุขภาพยามเช้า",
        details: "ค่าวัดน้ำหนักตัวจากเครื่องชั่งดิจิทัลและเครื่องวัดความดัน น้ำหนัก 68.5 kg ความดันโลหิตอยู่ในเกณฑ์ปกติ ชีพจรปกติ",
        confidence: "High",
        confidence_percentage: 97,
        suggested_tags: ["สุขภาพ", "น้ำหนักตัว", "ความดัน", "บันทึกเช้า"],
        estimated_values: {
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          weight: "68.5 kg",
          blood_pressure: "118/78 mmHg",
          blood_sugar: "92 mg/dL",
          merchant: "บ้าน (โฮมยามเช้า)",
          price: "ไม่สามารถระบุราคาได้จากภาพ",
          payment_method: "ไม่สามารถระบุได้จากภาพ"
        }
      };
    } else if (presetType === 'garage') {
      mockParsed = {
        category: "GARAGE",
        display_category: "รถยนต์",
        title: "ซ่อมบำรุงและเปลี่ยนน้ำมันเครื่องรถยนต์",
        summary: "บันทึกการเช็คระยะและเปลี่ยนน้ำมันเครื่องรถยนต์ Toyota Prius",
        details: "สลิปหรือใบเสร็จรับเงินงานบริการรถยนต์ เปลี่ยนถ่ายน้ำมันเครื่อง ไส้กรอง ตรวจเช็คระบบไฟฟ้า ไฮบริด ยอดรวม 4,500.00 บาท",
        confidence: "High",
        confidence_percentage: 96,
        suggested_tags: ["รถยนต์", "เช็คระยะ", "โตโยต้า", "ค่าบำรุงรักษา"],
        estimated_values: {
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          weight: null,
          blood_pressure: null,
          blood_sugar: null,
          merchant: "Toyota Buzz Sathon",
          price: "4,500.00 THB",
          payment_method: "โอนเงิน"
        }
      };
    }

    if (mockParsed) {
      const ev = mockParsed.estimated_values || {};
      let amtValue = 0;
      let matchedUnit = '';
      if (mockParsed.display_category === 'อาหาร' && ev.calories) {
        const matched = ev.calories.match(/\d+/);
        if (matched) {
          amtValue = parseInt(matched[0]);
          matchedUnit = 'KCAL';
        }
      } else if (mockParsed.display_category === 'สุขภาพ' && ev.weight) {
        const matched = ev.weight.match(/\d+(\.\d+)?/);
        if (matched) {
          amtValue = parseFloat(matched[0]);
          matchedUnit = 'KG';
        }
      } else if (mockParsed.display_category === 'การเงิน' && ev.price && ev.price !== 'ไม่สามารถระบุราคาได้จากภาพ') {
        const matched = ev.price.match(/\d+(\.\d+)?/);
        if (matched) {
          amtValue = parseFloat(matched[0]);
          matchedUnit = 'THB';
        }
      }

      const mappedData = {
        ...mockParsed,
        main_category: mockParsed.category,
        subject: mockParsed.title,
        amount_value: amtValue,
        unit: matchedUnit,
        tags: mockParsed.suggested_tags || []
      };

      setReviewData(mappedData);
      setEditableReviewData(mappedData);
      setApiFailed(false);
      setErrorMessage(null);
      setErrorType(null);
      setIsEditing(false);
      
      setToast({
        message: "⚡ จำลองข้อมูลการสแกนสำเร็จแล้ว! สามารถกด 'บันทึกลง Timeline' ได้ทันที",
        type: "success"
      });
    }
  };

  const triggerIngestion = async () => {
    setLoading(true);
    setResults(null);
    setErrorMessage(null);
    setApiFailed(false);
    setErrorType(null);

    let base64Payload = '';
    let mimeTypePayload = uploadedMime;

    if (uploadedImage) {
      base64Payload = uploadedImage.split(',')[1] || '';
    } else {
      setErrorMessage("กรุณาเลือกรูปภาพหรือถ่ายภาพก่อน");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/gemini/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: mimeTypePayload,
          type: 'receipt'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const rawData = await response.json();
      setResults(rawData);

      if (rawData && (rawData.success === false || rawData.status === 'api_failed')) {
        setApiFailed(true);
        const errType = rawData.errorType || "API Error";
        setErrorType(errType);
        setErrorMessage(rawData.message || "AI ไม่สามารถวิเคราะห์ภาพได้ในขณะนี้ (Quota หรือ API Error)");
        setReviewData(null);
        setEditableReviewData(null);

        // Log separately based on the specific type
        if (errType === "Quota Error") {
          console.error("Quota Error: Gemini API quota exceeded or resource exhausted.");
        } else if (errType === "Timeout Error") {
          console.error("Timeout Error: Gemini API call timed out.");
        } else {
          console.error("API Error: General Gemini API failure or HTTP 500.", rawData.rawError);
        }
        return;
      }

      if (rawData && rawData.data) {
        const parsed = rawData.data;
        const ev = parsed.estimated_values || {};
        
        let amtValue = 0;
        let matchedUnit = '';
        if (parsed.display_category === 'อาหาร' && ev.calories) {
          const matched = ev.calories.match(/\d+/);
          if (matched) {
            amtValue = parseInt(matched[0]);
            matchedUnit = 'KCAL';
          }
        } else if (parsed.display_category === 'สุขภาพ' && ev.weight) {
          const matched = ev.weight.match(/\d+(\.\d+)?/);
          if (matched) {
            amtValue = parseFloat(matched[0]);
            matchedUnit = 'KG';
          }
        } else if (parsed.display_category === 'การเงิน' && ev.price && ev.price !== 'ไม่สามารถระบุราคาได้จากภาพ') {
          const matched = ev.price.match(/\d+(\.\d+)?/);
          if (matched) {
            amtValue = parseFloat(matched[0]);
            matchedUnit = 'THB';
          }
        }

        const mappedData = {
          ...parsed,
          main_category: parsed.category, // e.g. HEALTH, FINANCE
          subject: parsed.title,
          amount_value: amtValue,
          unit: matchedUnit,
          tags: parsed.suggested_tags || []
        };

        setReviewData(mappedData);
        setEditableReviewData(mappedData);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || String(err);
      let errType = "API Error";
      if (errMsg.includes("429") || errMsg.toUpperCase().includes("QUOTA") || errMsg.toUpperCase().includes("LIMIT") || errMsg.toUpperCase().includes("RESOURCE_EXHAUSTED")) {
        errType = "Quota Error";
        console.error("Quota Error: Network / local detection of Gemini quota exhaustion.", errMsg);
      } else if (errMsg.toLowerCase().includes("timeout") || errMsg.toLowerCase().includes("deadline") || errMsg.toLowerCase().includes("etimedout")) {
        errType = "Timeout Error";
        console.error("Timeout Error: Gemini operation timed out locally.", errMsg);
      } else {
        errType = "API Error";
        console.error("API Error: General network or server failure.", errMsg);
      }
      setErrorType(errType);
      setApiFailed(true);
      setErrorMessage("AI ไม่สามารถวิเคราะห์ภาพได้ในขณะนี้ (Quota หรือ API Error)");
      setResults(null);
      setReviewData(null);
      setEditableReviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApproved = async () => {
    if (!editableReviewData || apiFailed || editableReviewData.status === 'api_failed') {
      console.warn("Save blocked: Gemini Ingestion API failed.");
      return;
    }
    setLoading(true);
    saveLearnedCategory(editableReviewData.title || editableReviewData.subject, editableReviewData.category || editableReviewData.main_category);

    try {
        const parsed = { ...editableReviewData };
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);
        
        // Map target category nicely
        let targetCategory: 'finance' | 'health' | 'garage' | 'work' | 'lifestyle' | 'travel' = 'lifestyle';
        const displayCat = parsed.display_category || "อื่นๆ";
        if (displayCat === 'อาหาร' || displayCat === 'สุขภาพ' || displayCat === 'การออกกำลังกาย') {
          targetCategory = 'health';
        } else if (displayCat === 'การเงิน' || displayCat === 'การช้อปปิ้ง') {
          targetCategory = 'finance';
        } else if (displayCat === 'รถยนต์') {
          targetCategory = 'garage';
        } else if (displayCat === 'การทำงาน' || displayCat === 'เอกสาร') {
          targetCategory = 'work';
        } else if (displayCat === 'การเดินทาง') {
          targetCategory = 'travel';
        } else {
          targetCategory = 'lifestyle';
        }

        const ev = parsed.estimated_values || {};
        let valFormatted = "";
        let unitFormatted = "";
        if (displayCat === 'อาหาร' && ev.calories) {
          const numOnly = ev.calories.replace(/[^0-9]/g, '');
          valFormatted = numOnly ? parseInt(numOnly).toLocaleString() : "";
          unitFormatted = "kcal";
        } else if (displayCat === 'สุขภาพ' && ev.weight) {
          const numOnly = ev.weight.replace(/[^0-9.]/g, '');
          valFormatted = numOnly ? parseFloat(numOnly).toFixed(1) : "";
          unitFormatted = "kg";
        } else if (displayCat === 'การเงิน' && ev.price && ev.price !== 'ไม่สามารถระบุราคาได้จากภาพ') {
          const numOnly = ev.price.replace(/[^0-9.]/g, '');
          valFormatted = numOnly ? parseFloat(numOnly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
          unitFormatted = "THB";
        }

        let explanation = `📝 บันทึกความเข้าใจเหตุการณ์ชีวิต (Life Event Understanding)\n\n`;
        explanation += `• เหตุการณ์: ${parsed.summary || parsed.title}\n`;
        explanation += `• รายละเอียดเพิ่มเติม: ${parsed.details || ''}\n`;
        
        if (ev.calories) explanation += `• พลังงาน: ${ev.calories}\n`;
        if (ev.protein) explanation += `• โปรตีน: ${ev.protein}\n`;
        if (ev.carbs) explanation += `• คาร์โบไฮเดรต: ${ev.carbs}\n`;
        if (ev.fat) explanation += `• ไขมัน: ${ev.fat}\n`;
        if (ev.weight) explanation += `• น้ำหนักตัว: ${ev.weight}\n`;
        if (ev.blood_pressure) explanation += `• ความดันโลหิต: ${ev.blood_pressure}\n`;
        if (ev.blood_sugar) explanation += `• ค่าน้ำตาลในเลือด: ${ev.blood_sugar}\n`;
        if (ev.merchant) explanation += `• ร้านค้า/ผู้ให้บริการ: ${ev.merchant}\n`;
        if (ev.price) explanation += `• ยอดเงิน: ${ev.price}\n`;
        if (ev.payment_method) explanation += `• ช่องทางชำระเงิน: ${ev.payment_method}\n`;

        explanation += `\nความเชื่อมั่นในการประมวลผล: ${parsed.confidence_percentage}% (${parsed.confidence})`;

        const tagsList = Array.isArray(parsed.suggested_tags) 
          ? parsed.suggested_tags.map((t: string) => t.startsWith('#') ? t : `#${t}`) 
          : [`#${targetCategory}`, '#ai-scan', '#life-event'];

        const newTimelineEvent = {
            id: `ai-${Date.now()}`,
            timestamp: now.toISOString().slice(0, 19).replace('T', ' '),
            timeLabel: `${timeStr} (Life Event AI)`,
            category: targetCategory,
            subject: parsed.title || `บันทึกเหตุการณ์ชีวิต (${displayCat})`,
            value: valFormatted,
            unit: unitFormatted,
            isIncome: targetCategory === 'finance' ? false : undefined,
            details: explanation,
            tags: tagsList,
            status: 'simulated' as const,
            sheetTarget: displayCat === 'อาหาร' || displayCat === 'สุขภาพ' || displayCat === 'การออกกำลังกาย' ? 'HLT_HEALTH_METRICS_V3' : 
                         displayCat === 'รถยนต์' ? 'GAR_LOGS_V3' : 
                         displayCat === 'การทำงาน' || displayCat === 'เอกสาร' ? 'WRK_TIME_LOGS_V3' : 
                         displayCat === 'การเงิน' || displayCat === 'การช้อปปิ้ง' ? 'FIN_TRANSACTIONS_V3' : 'MASTER_LOGS_ACTIVE'
        };

        const existingItemsStr = safeLocalStorage.getItem('tuk_life_timeline_events');
        let currentTimeline = [];
        if (existingItemsStr) {
            try {
              currentTimeline = JSON.parse(existingItemsStr);
            } catch (e) {
              currentTimeline = [];
            }
        }
        const updatedTimeline = [newTimelineEvent, ...currentTimeline];
        safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updatedTimeline));

        const webAppUrl = safeLocalStorage.getItem('tuk_life_web_app_url');
        if (webAppUrl) {
            await dispatchParsedResult(parsed);
        } else {
            setToast({
            message: '🎉 วิเคราะห์ข้อมูลสำเร็จและบันทึกประวัติจำลองแล้ว! (เชื่อมต่อ Google Sheets เพื่อซิงค์จริง)',
            type: 'success'
            });
        }
        clearUploaded();
    } catch (err: any) {
        console.error(err);
        setToast({ message: `⚠️ Save failed: ${err.message}`, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const clearUploaded = () => {
    setUploadedImage(null);
    setResults(null);
    setErrorMessage(null);
    setDispatchStatus(null);
    setShowPopup(true);
    setApiFailed(false);
    setErrorType(null);
  };

  return (
    <div className="max-w-md mx-auto py-4 px-2 font-sans relative">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2 font-sans">
          <span>📸 สแกนรูปภาพ</span>
        </h2>
      </div>

      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-4"
          >
            <button
              onClick={() => setShowPopup(true)}
              className="flex flex-col items-center justify-center p-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl cursor-pointer transition-all duration-155 active:scale-98 shadow-xs"
            >
              <div className="text-5xl mb-4">📸</div>
              <span className="text-lg font-black text-slate-800">สแกนรูปพร้อม AI</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="selected-preview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Selected Image Wrapper */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-100 relative group">
              <img
                src={uploadedImage}
                alt="Uploaded Scan"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-10">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-sm font-bold tracking-wide">กำลังวิเคราะห์ภาพ…</span>
                </div>
              )}
            </div>

            {loading && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">กำลังวิเคราะห์ภาพ…</p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {!reviewData && !loading && !apiFailed && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={triggerIngestion}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 active:scale-98 cursor-pointer text-sm shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>วิเคราะห์ภาพ</span>
                </button>
                <button
                  onClick={clearUploaded}
                  className="w-full bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-98 cursor-pointer text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            )}

            {reviewData && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ผลการวิเคราะห์ด้วย AI (AI Scan Result)</span>
                </h3>

                {isEditing ? (
                  /* EDIT MODE */
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">ประเภท (Category):</label>
                      <select 
                        value={editableReviewData.display_category || "อื่นๆ"} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableReviewData({
                            ...editableReviewData, 
                            display_category: val
                          });
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium"
                      >
                        <option value="อาหาร">อาหาร</option>
                        <option value="สุขภาพ">สุขภาพ</option>
                        <option value="การเงิน">การเงิน</option>
                        <option value="การเดินทาง">การเดินทาง</option>
                        <option value="การออกกำลังกาย">การออกกำลังกาย</option>
                        <option value="การทำงาน">การทำงาน</option>
                        <option value="การช้อปปิ้ง">การช้อปปิ้ง</option>
                        <option value="เอกสาร">เอกสาร</option>
                        <option value="รถยนต์">รถยนต์</option>
                        <option value="บ้าน">บ้าน</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">หัวข้อ (Title):</label>
                      <input 
                        type="text"
                        value={editableReviewData.title || ""} 
                        onChange={(e) => setEditableReviewData({...editableReviewData, title: e.target.value})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">รายละเอียดสรุป (Summary):</label>
                      <input 
                        type="text"
                        value={editableReviewData.summary || ""} 
                        onChange={(e) => setEditableReviewData({...editableReviewData, summary: e.target.value})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">รายละเอียดเชิงลึก (Details):</label>
                      <textarea 
                        rows={3}
                        value={editableReviewData.details || ""} 
                        onChange={(e) => setEditableReviewData({...editableReviewData, details: e.target.value})} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">ความมั่นใจ (%) (Confidence %):</label>
                        <input 
                          type="number"
                          min={0}
                          max={100}
                          value={editableReviewData.confidence_percentage || 0} 
                          onChange={(e) => setEditableReviewData({
                            ...editableReviewData, 
                            confidence_percentage: parseInt(e.target.value) || 0
                          })} 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">ระดับความมั่นใจ (Confidence):</label>
                        <select 
                          value={editableReviewData.confidence || "Low"} 
                          onChange={(e) => setEditableReviewData({...editableReviewData, confidence: e.target.value})} 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">ราคา (Price):</label>
                      <input 
                        type="text"
                        value={editableReviewData.estimated_values?.price || ""} 
                        onChange={(e) => setEditableReviewData({
                          ...editableReviewData, 
                          estimated_values: {
                            ...(editableReviewData.estimated_values || {}),
                            price: e.target.value
                          }
                        })} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">สถานที่ (Merchant / Location):</label>
                      <input 
                        type="text"
                        value={editableReviewData.estimated_values?.merchant || ""} 
                        onChange={(e) => setEditableReviewData({
                          ...editableReviewData, 
                          estimated_values: {
                            ...(editableReviewData.estimated_values || {}),
                            merchant: e.target.value
                          }
                        })} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">การชำระเงิน (Payment Method):</label>
                      <input 
                        type="text"
                        value={editableReviewData.estimated_values?.payment_method || ""} 
                        onChange={(e) => setEditableReviewData({
                          ...editableReviewData, 
                          estimated_values: {
                            ...(editableReviewData.estimated_values || {}),
                            payment_method: e.target.value
                          }
                        })} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs font-medium" 
                      />
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none">
                        {getEventEmoji(editableReviewData.display_category || "อื่นๆ")}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            ประเภท: {editableReviewData.display_category || "อื่นๆ"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight pt-1">
                          หัวข้อ: {editableReviewData.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
                          <span>📅 {getFormattedTime()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-b border-slate-100 py-3.5 space-y-2 text-xs">
                      <p className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium">ประเภท:</span>
                        <span className="font-bold text-slate-800">{editableReviewData.display_category || "อื่นๆ"}</span>
                      </p>
                      
                      <p className="flex justify-between items-start border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium shrink-0">หัวข้อ:</span>
                        <span className="font-bold text-slate-800 text-right">{editableReviewData.title || "ไม่ระบุ"}</span>
                      </p>

                      <div className="flex flex-col gap-1 border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium">รายละเอียด:</span>
                        <div className="text-slate-800 bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed space-y-1">
                          {editableReviewData.summary && (
                            <p className="font-semibold text-emerald-800">📝 สรุป: {editableReviewData.summary}</p>
                          )}
                          <p>{editableReviewData.details || "ไม่ระบุ"}</p>
                        </div>
                      </div>

                      <p className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium">ความมั่นใจ:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {editableReviewData.confidence_percentage}% ({editableReviewData.confidence || "Low"})
                        </span>
                      </p>

                      <p className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium">ราคา:</span>
                        <span className="font-bold text-slate-800">
                          {editableReviewData.estimated_values?.price || "ไม่สามารถระบุราคาได้จากภาพ"}
                        </span>
                      </p>

                      <p className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                        <span className="text-slate-500 font-medium">สถานที่:</span>
                        <span className="font-bold text-slate-800">
                          {editableReviewData.estimated_values?.merchant || "ไม่สามารถระบุได้จากภาพ"}
                        </span>
                      </p>

                      <p className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">การชำระเงิน:</span>
                        <span className="font-bold text-slate-800">
                          {editableReviewData.estimated_values?.payment_method || "ไม่สามารถระบุได้จากภาพ"}
                        </span>
                      </p>
                    </div>

                    {/* Additional food/health details if present */}
                    {(editableReviewData.display_category === 'อาหาร' || editableReviewData.display_category === 'สุขภาพ') && (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-1.5 text-[11px]">
                        <span className="font-bold text-amber-800 block">📊 ค่าที่ประมาณการเพิ่มเติม (Additional Estimates)</span>
                        {editableReviewData.display_category === 'อาหาร' && (
                          <div className="grid grid-cols-2 gap-1 text-slate-700 font-medium">
                            {editableReviewData.estimated_values?.calories && <span>🔥 พลังงาน: {editableReviewData.estimated_values.calories}</span>}
                            {editableReviewData.estimated_values?.protein && <span>🥩 โปรตีน: {editableReviewData.estimated_values.protein}</span>}
                            {editableReviewData.estimated_values?.carbs && <span>🍚 คาร์บ: {editableReviewData.estimated_values.carbs}</span>}
                            {editableReviewData.estimated_values?.fat && <span>🥑 ไขมัน: {editableReviewData.estimated_values.fat}</span>}
                          </div>
                        )}
                        {editableReviewData.display_category === 'สุขภาพ' && (
                          <div className="grid grid-cols-2 gap-1 text-slate-700 font-medium">
                            {editableReviewData.estimated_values?.weight && <span>⚖️ น้ำหนัก: {editableReviewData.estimated_values.weight}</span>}
                            {editableReviewData.estimated_values?.blood_pressure && <span>🩺 ความดัน: {editableReviewData.estimated_values.blood_pressure}</span>}
                            {editableReviewData.estimated_values?.blood_sugar && <span>🩸 น้ำตาล: {editableReviewData.estimated_values.blood_sugar}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ingestion Actions */}
                <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={loading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    {isEditing ? 'เสร็จสิ้น' : 'แก้ไข'}
                  </button>
                  <button
                    onClick={handleSaveApproved}
                    disabled={isEditing || loading}
                    className={`flex-1 font-bold py-3 rounded-xl text-xs transition-all duration-150 active:scale-98 cursor-pointer text-center flex items-center justify-center ${
                      isEditing || loading
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-850 text-white'
                    }`}
                  >
                    บันทึกลง Timeline
                  </button>
                  <button
                    onClick={clearUploaded}
                    disabled={loading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            {apiFailed && !loading && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-center space-y-4">
                <div className="text-4xl">⚠️</div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-950">
                    {errorType === "Quota Error" ? "ขีดจำกัดโควตาเต็ม (Quota Error)" : 
                     errorType === "Timeout Error" ? "หมดเวลาเชื่อมต่อ (Timeout Error)" : 
                     "เกิดข้อผิดพลาดในการเชื่อมต่อ (API Error)"}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-semibold">
                    {errorType === "Quota Error" ? "คุณใช้โควตาฟรีของ Gemini API ครบตามที่กำหนดในวันนี้แล้ว" : "AI ไม่สามารถวิเคราะห์ภาพได้ในขณะนี้ (Quota หรือ API Error)"}
                  </p>
                </div>

                {/* SIMULATOR PRESETS SELECTION */}
                <div className="bg-white border border-slate-100 p-4 rounded-xl text-left space-y-2.5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🛠️ ตัวเลือกจำลองเหตุการณ์ (Simulator Mode)</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    เนื่องจากโควตาเต็ม คุณสามารถเลือกจำลองผลการวิเคราะห์ภาพด้านล่างเพื่อทำการทดสอบฟีเจอร์แก้ไข ซิงค์ Google Sheets หรือเซฟประวัติลง Timeline ต่อได้ทันที:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleUseMockPreset('food')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold p-2 rounded-xl border border-slate-200/60 text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🍽️ อาหาร (Food)</span>
                    </button>
                    <button
                      onClick={() => handleUseMockPreset('finance')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold p-2 rounded-xl border border-slate-200/60 text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>💵 การเงิน (Finance)</span>
                    </button>
                    <button
                      onClick={() => handleUseMockPreset('health')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold p-2 rounded-xl border border-slate-200/60 text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🩺 สุขภาพ (Health)</span>
                    </button>
                    <button
                      onClick={() => handleUseMockPreset('garage')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold p-2 rounded-xl border border-slate-200/60 text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>🚗 ยานพาหนะ (Garage)</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-1.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={clearUploaded}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all duration-150 active:scale-98 cursor-pointer text-center"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={triggerIngestion}
                    className="bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 rounded-xl text-xs transition-all duration-150 active:scale-98 cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ลองวิเคราะห์ใหม่</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice Popup / Bottom Sheet */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-55 flex items-end justify-center sm:items-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              id="scan-picker-backdrop"
            />
            
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto p-4 space-y-3 z-10 border border-slate-100"
              id="scan-picker-sheet"
            >
              <button
                onClick={() => {
                  setShowPopup(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold transition-all duration-150 active:scale-98 cursor-pointer text-sm"
                id="btn-scan-camera"
              >
                <span>📷 ถ่ายรูปพร้อม AI</span>
              </button>

              <button
                onClick={() => {
                  setShowPopup(false);
                  galleryInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold transition-all duration-150 active:scale-98 cursor-pointer text-sm"
                id="btn-scan-gallery"
              >
                <span>🖼️ เลือกจากคลังภาพพร้อม AI</span>
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-all duration-150 active:scale-98 cursor-pointer text-sm"
                id="btn-scan-cancel"
              >
                ยกเลิก
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border shadow-lg max-w-sm ${
              toast.type === 'success'
                ? 'bg-amber-50 border-amber-200 text-stone-850'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-850'
                : 'bg-stone-50 border-stone-200 text-stone-805'
            }`}
          >
            <Check className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold leading-normal text-stone-800">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-600 ml-auto text-xs font-black"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
