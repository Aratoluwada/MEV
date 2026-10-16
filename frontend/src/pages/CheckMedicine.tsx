import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Mic, 
  MicOff, 
  Search, 
  X, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Volume2,
  Trash2,
  FileCheck
} from 'lucide-react';
import { 
  CheckRequest, 
  CheckResponse, 
  LanguageCode, 
  BasketItem, 
  VerdictType, 
  SamplePack 
} from '../types';
import { checkMedicine, extractFromImage } from '../api';
import { SAMPLE_PACKS } from '../mockRegistry';

interface CheckMedicineProps {
  language: LanguageCode;
  onAddToBasket: (item: BasketItem) => void;
  basket: BasketItem[];
}

type InputMode = 'image' | 'manual' | 'voice';

export const CheckMedicine: React.FC<CheckMedicineProps> = ({
  language,
  onAddToBasket,
  basket,
}) => {
  const [activeMode, setActiveMode] = useState<InputMode>('image');

  // Manual Form State
  const [productName, setProductName] = useState('');
  const [nrn, setNrn] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [activeIngredients, setActiveIngredients] = useState('');

  // Image Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Inspection & Result State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [checkError, setCheckError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 1. RUN LOOKUP ENGINE
  const executeLookup = async (req: CheckRequest) => {
    setIsLoading(true);
    setCheckError(null);
    setLoadingStep(
      language === 'pcm' 
        ? 'Dey query NAFDAC Green Book database...' 
        : 'Querying NAFDAC Green Book regulatory snapshot...'
    );

    try {
      const payload: CheckRequest = {
        ...req,
        language,
      };

      const response = await checkMedicine(payload);
      setResult(response);
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setCheckError(
        language === 'pcm'
          ? 'Network problem or system error. Try again small time.'
          : 'Failed to complete registry lookup. Please check your network and retry.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 2. MANUAL SUBMISSION
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() && !nrn.trim()) {
      setCheckError('Please provide at least a Product Name or a NAFDAC Registration Number (NRN).');
      return;
    }

    const ingredientsList = activeIngredients.trim()
      ? activeIngredients.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    executeLookup({
      product_name: productName.trim() || undefined,
      nrn: nrn.trim() || undefined,
      strength: strength.trim() || undefined,
      dosage_form: dosageForm.trim() || undefined,
      active_ingredients: ingredientsList,
    });
  };

  // 3. IMAGE UPLOAD & PROCESSING
  const handleFileSelection = async (file: File) => {
    setFileError(null);
    setCheckError(null);

    // Validate type and size (max 10MB)
    if (!file.type.startsWith('image/')) {
      setFileError('Invalid file type. Please upload a standard image (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('Image is too large. Maximum supported size is 10MB.');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);

    // Auto extract details
    setIsLoading(true);
    setLoadingStep(
      language === 'pcm'
        ? 'Dey scan text on top pack photo...'
        : 'Scanning packaging label & extracting regulatory text...'
    );

    try {
      const { extractedData } = await extractFromImage(file);
      
      // Populate manual inputs for user transparency
      if (extractedData.product_name) setProductName(extractedData.product_name);
      if (extractedData.nrn) setNrn(extractedData.nrn);
      if (extractedData.strength) setStrength(extractedData.strength);
      if (extractedData.dosage_form) setDosageForm(extractedData.dosage_form);
      if (extractedData.active_ingredients) setActiveIngredients(extractedData.active_ingredients.join(', '));

      setLoadingStep(
        language === 'pcm'
          ? 'Dey match extracted text with NAFDAC records...'
          : 'Cross-referencing extracted details against NAFDAC database...'
      );

      await executeLookup(extractedData);
    } catch (err) {
      console.error('Image scan error:', err);
      setCheckError('Unable to extract legible label text from image. Please retake photo with clearer lighting.');
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setUploadedFile(null);
    setFileError(null);
  };

  // 4. VOICE SPEECH RECOGNITION
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please use the quick sample spoken phrases or type manually.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      setVoiceError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'pcm' ? 'en-NG' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setVoiceTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
        setVoiceError('Microphone could not capture audio clearly. You can edit the text or try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start voice recognition:', err);
      setVoiceError('Microphone access was denied or is unavailable.');
      setIsListening(false);
    }
  };

  const handleVoiceSubmit = () => {
    const clean = voiceTranscript.trim();
    if (!clean) return;

    setProductName(clean);
    const isNrn = /^[A-Za-z0-9]{2,4}-[0-9]{4,6}$/i.test(clean);
    if (isNrn) {
      setNrn(clean);
      executeLookup({ nrn: clean });
    } else {
      executeLookup({ product_name: clean });
    }
  };

  // 5. SAMPLE PRESET SELECTION
  const handleSelectPreset = (sample: SamplePack) => {
    handleClearImage();
    setResult(null);
    setCheckError(null);

    setProductName(sample.request.product_name || '');
    setNrn(sample.request.nrn || '');
    setStrength(sample.request.strength || '');
    setDosageForm(sample.request.dosage_form || '');
    setActiveIngredients(sample.request.active_ingredients?.join(', ') || '');

    executeLookup(sample.request);
  };

  // 6. BASKET ADDITION
  const handleAddCurrentToBasket = () => {
    if (!result) return;
    const record = result.matched_record;
    const name = record?.product_name || result.extracted?.name || productName || 'Checked Medicine';
    const regNrn = record?.nrn || result.extracted?.nrn || nrn || 'N/A';
    const ings = record?.active_ingredients || result.extracted?.active_ingredients || (name ? [name] : ['Medicine']);
    const str = record?.strength || result.extracted?.strength || strength || 'Unspecified';
    const form = record?.dosage_form || result.extracted?.dosage_form || dosageForm || 'Form';
    const mfg = record?.manufacturer || result.extracted?.manufacturer || 'Unknown';

    onAddToBasket({
      id: `${regNrn}-${Date.now()}`,
      addedAt: Date.now(),
      product_name: name,
      nrn: regNrn,
      active_ingredients: ings,
      strength: str,
      dosage_form: form,
      manufacturer: mfg,
      verdict: result.verdict,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const isAlreadyInBasket = Boolean(
    result &&
    basket.some(
      (b) =>
        b.nrn === result.matched_record?.nrn ||
        b.product_name === result.matched_record?.product_name ||
        b.product_name === productName
    )
  );

  // VERDICT CONFIGURATION (Strictly neutral language, NO "genuine" or "fake")
  const getVerdictCardConfig = (verdict: VerdictType) => {
    switch (verdict) {
      case 'REGISTERED_MATCH':
        return {
          title: language === 'pcm' ? 'Registration Record Match' : 'Registration Record Found',
          subtitle: language === 'pcm' 
            ? 'NAFDAC registration active and pack details agree with record' 
            : 'Active registration record verified with matching packaging attributes',
          badgeText: 'RECORD FOUND • MATCH',
          bgColor: 'bg-[#A9F04D]',
          textColor: 'text-[#171717]',
          icon: ShieldCheck,
        };
      case 'REGISTERED_MISMATCH':
        return {
          title: language === 'pcm' ? 'Information Mismatch Flagged' : 'Information Mismatch Detected',
          subtitle: language === 'pcm'
            ? 'Dis NRN dey registered, but pack details conflict with official record'
            : 'Registration exists, but submitted packaging details conflict with registry',
          badgeText: 'DISCREPANCY FLAGGED',
          bgColor: 'bg-[#FF7B70]',
          textColor: 'text-[#171717]',
          icon: AlertTriangle,
        };
      case 'EXPIRED':
        return {
          title: language === 'pcm' ? 'Registration Don Expire' : 'Registration Authorization Expired',
          subtitle: language === 'pcm'
            ? 'Dis medicine registration authorization don elapse'
            : 'Marketing authorization has expired and is not active in this regulatory snapshot',
          badgeText: 'AUTHORIZATION EXPIRED',
          bgColor: 'bg-[#F5E947]',
          textColor: 'text-[#171717]',
          icon: Clock,
        };
      case 'NOT_FOUND':
      default:
        return {
          title: language === 'pcm' ? 'No Matching Record' : 'No Matching Record Found',
          subtitle: language === 'pcm'
            ? 'We no see dis NRN or medicine name inside Green Book snapshot'
            : 'No matching regulatory record found in the Green Book snapshot',
          badgeText: 'RECORD NOT LOCATED',
          bgColor: 'bg-[#E5E5E5]',
          textColor: 'text-[#171717]',
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* PAGE HEADER */}
      <div className="border-b-3 border-[#171717] pb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5E947] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717]">
            <span className="w-2 h-2 bg-[#171717]" />
            <span>NAFDAC GREEN BOOK REGISTRY WORKSPACE</span>
          </div>

          <span className="font-mono text-xs font-bold text-[#666666]">
            DATASET: 2024 SNAPSHOT
          </span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#171717] tracking-tight">
          CHECK A MEDICINE
        </h1>

        <p className="text-sm sm:text-base text-[#444444] font-medium max-w-2xl">
          {language === 'pcm'
            ? 'Select camera, text, or voice below to cross-check medicine details against official regulatory records.'
            : 'Select an input mode below to cross-reference medicine packaging details against official NAFDAC registration entries.'}
        </p>
      </div>

      {/* QUICK PRESET TEST SCENARIOS (Clearly labeled DEMO DATA) */}
      <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase text-[#171717] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4169F5]" />
            <span>TEST SAMPLES [DEMO DATA]</span>
          </span>
          <span className="text-[11px] font-mono text-[#777777]">
            1-Click scenario testing
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_PACKS.map((sample: any) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectPreset(sample)}
              className="px-3 py-1.5 bg-[#FFF9ED] hover:bg-[#F5E947] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-mono font-bold text-[#171717] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[10px] px-1 bg-white border border-[#171717] uppercase">
                {sample.badge}
              </span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INPUT METHOD SELECTOR TABS */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 border-3 border-[#171717] bg-[#171717] shadow-[4px_4px_0px_#171717] divide-x-2 divide-[#171717]">
          
          <button
            type="button"
            onClick={() => setActiveMode('image')}
            className={`py-3.5 px-3 text-center font-heading font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'image'
                ? 'bg-[#F5E947] text-[#171717]'
                : 'bg-white text-[#171717] hover:bg-[#FFF9ED]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">[01]</span>
            <span>IMAGE / CAMERA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`py-3.5 px-3 text-center font-heading font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-[#F5E947] text-[#171717]'
                : 'bg-white text-[#171717] hover:bg-[#FFF9ED]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">[02]</span>
            <span>TYPE DETAILS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('voice')}
            className={`py-3.5 px-3 text-center font-heading font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'voice'
                ? 'bg-[#F5E947] text-[#171717]'
                : 'bg-white text-[#171717] hover:bg-[#FFF9ED]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">[03]</span>
            <span>VOICE INPUT</span>
          </button>

        </div>

        {/* WORKSPACE CARD */}
        <div className="bg-white border-3 border-[#171717] p-5 sm:p-8 shadow-[6px_6px_0px_#171717]">
          
          {/* MODE 1: IMAGE / CAMERA UPLOAD */}
          {activeMode === 'image' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-black text-xl text-[#171717]">
                  Photograph or Upload Medicine Pack
                </h3>
                <p className="text-xs sm:text-sm text-[#555555] mt-1">
                  Ensure the NAFDAC registration number (NRN) and brand text on the packaging are clearly illuminated and in focus.
                </p>
              </div>

              {photoPreview ? (
                <div className="border-3 border-[#171717] bg-[#FFF9ED] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img
                      src={photoPreview}
                      alt="Uploaded medicine pack"
                      className="w-36 h-36 object-cover border-2 border-[#171717] shadow-[3px_3px_0px_#171717] bg-white shrink-0"
                    />
                    <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                      <div className="neo-badge bg-[#A9F04D] text-[#171717] inline-block">
                        IMAGE READY FOR INSPECTION
                      </div>
                      <h4 className="font-heading font-bold text-base text-[#171717] truncate">
                        {uploadedFile?.name || 'Pack photograph'}
                      </h4>
                      <p className="text-xs text-[#666666] font-mono">
                        Size: {uploadedFile ? (uploadedFile.size / 1024).toFixed(1) + ' KB' : 'Standard'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-[#171717]">
                    <button
                      type="button"
                      onClick={() => handleFileSelection(uploadedFile!)}
                      disabled={isLoading}
                      className="neo-btn-primary px-5 py-2.5 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'SCANNING...' : 'RE-SCAN IMAGE'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="neo-btn-secondary px-4 py-2.5 text-xs sm:text-sm uppercase tracking-wider text-rose-700 border-rose-900 gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>REMOVE / RETAKE</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed border-[#171717] p-8 sm:p-12 text-center transition-all ${
                    isDragging ? 'bg-[#F5E947]/30 border-[#4169F5]' : 'bg-[#FFF9ED]'
                  }`}
                >
                  {/* Hidden inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                    className="hidden"
                  />

                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 bg-[#F5E947] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex items-center justify-center mx-auto text-[#171717]">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-lg sm:text-xl text-[#171717]">
                        DRAG & DROP PACK IMAGE HERE
                      </h4>
                      <p className="text-xs sm:text-sm text-[#666666] mt-1">
                        JPEG, PNG, or WEBP up to 10MB
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="neo-btn-primary w-full sm:w-auto px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>OPEN CAMERA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="neo-btn-secondary w-full sm:w-auto px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>BROWSE FILES</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="p-3 bg-[#FF7B70] border-2 border-[#171717] font-mono text-xs font-bold text-[#171717]">
                  {fileError}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: MANUAL DETAILS FORM */}
          {activeMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <h3 className="font-heading font-black text-xl text-[#171717]">
                  Enter Medicine Packaging Information
                </h3>
                <p className="text-xs sm:text-sm text-[#555555] mt-1">
                  Provide at least the Medicine Name or the NAFDAC Registration Number (NRN).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-black uppercase text-[#171717]">
                    Medicine Name <span className="text-[#FF7B70]">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Emzor Paracetamol Tablets"
                    className="w-full px-3.5 py-2.5 bg-[#FFF9ED] border-2 border-[#171717] font-medium text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#171717]"
                  />
                  <p className="text-[11px] font-mono text-[#666666]">
                    Brand name printed on front of pack
                  </p>
                </div>

                {/* NRN */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-black uppercase text-[#171717]">
                    NAFDAC Reg No (NRN) <span className="text-[#FF7B70]">*</span>
                  </label>
                  <input
                    type="text"
                    value={nrn}
                    onChange={(e) => setNrn(e.target.value)}
                    placeholder="e.g. 04-1234 or A4-3290"
                    className="w-full px-3.5 py-2.5 bg-[#FFF9ED] border-2 border-[#171717] font-mono font-bold text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#171717]"
                  />
                  <p className="text-[11px] font-mono text-[#666666]">
                    Standard regulatory code on packaging
                  </p>
                </div>

                {/* Active Ingredients */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-[#171717]">
                    Active Ingredients (Optional)
                  </label>
                  <input
                    type="text"
                    value={activeIngredients}
                    onChange={(e) => setActiveIngredients(e.target.value)}
                    placeholder="e.g. Paracetamol or Artemether, Lumefantrine"
                    className="w-full px-3.5 py-2.5 bg-[#FFF9ED] border-2 border-[#171717] font-medium text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:bg-white"
                  />
                  <p className="text-[11px] font-mono text-[#666666]">
                    Comma-separated generic ingredients
                  </p>
                </div>

                {/* Strength */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-bold uppercase text-[#171717]">
                    Strength / Dosage (Optional)
                  </label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 500 mg or 20 mg / 120 mg"
                    className="w-full px-3.5 py-2.5 bg-[#FFF9ED] border-2 border-[#171717] font-medium text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Dosage Form */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-[#171717]">
                    Dosage Form (Optional)
                  </label>
                  <input
                    type="text"
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                    placeholder="e.g. Tablet, Capsule, Syrup, Caplet"
                    className="w-full px-3.5 py-2.5 bg-[#FFF9ED] border-2 border-[#171717] font-medium text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:bg-white"
                  />
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!productName.trim() && !nrn.trim())}
                  className="neo-btn-primary w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base uppercase tracking-wider gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  <span>{isLoading ? 'QUERYING REGISTRY...' : 'CHECK REGISTRATION RECORD'}</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: VOICE INPUT */}
          {activeMode === 'voice' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-black text-xl text-[#171717]">
                  Voice-Assisted Medicine Lookup
                </h3>
                <p className="text-xs sm:text-sm text-[#555555] mt-1">
                  Speak clearly into your microphone to dictate the medicine brand name or NRN code.
                </p>
              </div>

              {/* Voice Interactive Box */}
              <div className="bg-[#FFF9ED] border-3 border-[#171717] p-6 text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  {isListening && (
                    <span className="absolute w-20 h-20 rounded-full bg-[#FF7B70]/40 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`w-16 h-16 border-3 border-[#171717] shadow-[4px_4px_0px_#171717] flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-[#FF7B70] text-[#171717] translate-x-0.5 translate-y-0.5 shadow-none'
                        : 'bg-[#F5E947] text-[#171717] hover:bg-[#A9F04D]'
                    }`}
                    title={isListening ? 'Click to stop' : 'Click to speak'}
                  >
                    {isListening ? <Mic className="w-7 h-7 animate-pulse" /> : <MicOff className="w-7 h-7" />}
                  </button>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-base text-[#171717]">
                    {isListening ? 'LISTENING... SPEAK NOW' : 'TAP MICROPHONE TO BEGIN'}
                  </h4>
                  <p className="text-xs text-[#666666] font-mono mt-0.5">
                    {language === 'pcm' ? 'Say e.g. "Emzor Paracetamol" or "04-1234"' : 'Say e.g. "Emzor Paracetamol" or "NAFDAC number 04-1234"'}
                  </p>
                </div>

                {/* Editable Transcript Input */}
                <div className="space-y-1.5 text-left max-w-lg mx-auto">
                  <label className="block font-mono text-[11px] font-bold text-[#666666] uppercase">
                    Recognized Text (Editable):
                  </label>
                  <input
                    type="text"
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    placeholder="Spoken words will appear here..."
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-[#171717] font-heading font-bold text-sm text-[#171717] focus:outline-none"
                  />
                </div>

                {voiceTranscript && (
                  <button
                    type="button"
                    onClick={handleVoiceSubmit}
                    disabled={isLoading}
                    className="neo-btn-primary px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>CHECK WITH THIS TRANSCRIPT</span>
                  </button>
                )}
              </div>

              {voiceError && (
                <div className="p-3 bg-[#FF7B70] border-2 border-[#171717] font-mono text-xs font-bold text-[#171717]">
                  {voiceError}
                </div>
              )}

              {/* Spoken Query Fallbacks */}
              <div className="border-t-2 border-[#171717] pt-4 space-y-2">
                <span className="font-mono text-xs font-black uppercase text-[#171717] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#4169F5]" />
                  <span>OR SELECT A COMMON SPOKEN PHRASE:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Emzor Paracetamol 500mg',
                    '04-1234',
                    'Lonart DS Tablets',
                    'Amoxil 500mg'
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => {
                        setVoiceTranscript(phrase);
                        setProductName(phrase);
                        executeLookup({ product_name: phrase });
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-[#F5E947] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] shadow-[2px_2px_0px_#171717] cursor-pointer"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* LOADING STATE INDICATOR */}
      {isLoading && (
        <div className="bg-[#FFF9ED] border-3 border-[#171717] p-8 text-center space-y-4 shadow-[6px_6px_0px_#171717] animate-fade-in">
          <div className="relative inline-flex items-center justify-center">
            <span className="w-12 h-12 border-4 border-[#171717] border-t-[#F5E947] animate-spin" />
            <Search className="w-5 h-5 text-[#171717] absolute" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-[#171717]">
              CROSS-REFERENCING NAFDAC REGISTRY...
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#555555] mt-1 max-w-md mx-auto">
              {loadingStep || 'Comparing submitted packaging attributes against 2024 Green Book snapshot records.'}
            </p>
          </div>
        </div>
      )}

      {/* CHECK ERROR STATE */}
      {checkError && !isLoading && (
        <div className="bg-[#FF7B70] border-3 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] text-[#171717] flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-heading font-black text-sm uppercase">
                LOOKUP ERROR
              </h4>
              <p className="text-xs sm:text-sm font-medium">{checkError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCheckError(null)}
            className="p-1 border border-[#171717] bg-white hover:bg-[#FFF9ED]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RESULTS DISPLAY AREA */}
      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Verdict Card */}
          {(() => {
            const vConfig = getVerdictCardConfig(result.verdict);
            const VIcon = vConfig.icon;

            return (
              <div className={`border-3 border-[#171717] ${vConfig.bgColor} p-6 sm:p-8 shadow-[8px_8px_0px_#171717] space-y-6`}>
                
                {/* Verdict Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#171717] pb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#171717] text-white border-2 border-[#171717] shrink-0">
                      <VIcon className="w-7 h-7 text-[#F5E947]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="neo-badge bg-[#171717] text-white">
                          {vConfig.badgeText}
                        </span>
                        <span className="neo-badge bg-white text-[#171717]">
                          {result.confidence_percentage}% CONFIDENCE ({result.confidence_tier})
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#171717] leading-tight">
                        {vConfig.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#171717]/80 font-medium mt-0.5">
                        {vConfig.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Add to Basket Action */}
                  <button
                    type="button"
                    onClick={handleAddCurrentToBasket}
                    disabled={isAlreadyInBasket}
                    className={`neo-btn-primary px-4 py-2.5 text-xs uppercase tracking-wider shrink-0 gap-1.5 cursor-pointer ${
                      isAlreadyInBasket ? 'bg-white opacity-80 cursor-default' : ''
                    }`}
                  >
                    {isAlreadyInBasket ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>IN BASKET</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>ADD TO BASKET</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Summary Box */}
                <div className="bg-white border-2 border-[#171717] p-4 text-xs sm:text-sm text-[#171717] leading-relaxed">
                  <span className="font-mono text-[10px] font-black uppercase text-[#666666] block mb-1">
                    EXPLANATION SUMMARY:
                  </span>
                  <p className="font-medium">
                    {language === 'pcm'
                      ? (result.explanation?.pidgin_summary || result.explanation?.summary)
                      : result.explanation?.summary}
                  </p>
                </div>

                {/* FIELD-BY-FIELD EXTRACTED VS REGISTRY COMPARISON TABLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[#171717]">
                    <span>FIELD COMPARISON SPECIFICATION</span>
                    <span>ATTRIBUTES: {Object.keys(result.comparison || {}).length}</span>
                  </div>

                  <div className="bg-white border-2 border-[#171717] overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFF9ED] border-b-2 border-[#171717] font-mono uppercase text-[#171717]">
                          <th className="p-3 border-r-2 border-[#171717]">ATTRIBUTE</th>
                          <th className="p-3 border-r-2 border-[#171717]">SUBMITTED / ON PACK</th>
                          <th className="p-3 border-r-2 border-[#171717]">NAFDAC REGISTRY</th>
                          <th className="p-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171717]">
                        {Object.entries(result.comparison || {}).map(([key, val]) => {
                          if (!val) return null;
                          const subText = Array.isArray(val.submitted) ? val.submitted.join(', ') : String(val.submitted || '—');
                          const regText = Array.isArray(val.registry) ? val.registry.join(', ') : String(val.registry || '—');
                          
                          return (
                            <tr key={key} className={val.matches ? 'hover:bg-slate-50' : 'bg-[#FF7B70]/20'}>
                              <td className="p-3 border-r-2 border-[#171717] font-mono font-bold uppercase text-[#171717]">
                                {key.replace('_', ' ')}
                              </td>
                              <td className="p-3 border-r-2 border-[#171717] font-medium text-[#222222]">
                                {subText}
                              </td>
                              <td className="p-3 border-r-2 border-[#171717] font-bold text-[#171717]">
                                {regText}
                              </td>
                              <td className="p-3">
                                {val.matches ? (
                                  <span className="neo-badge bg-[#A9F04D] text-[#171717] inline-flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" /> MATCH
                                  </span>
                                ) : (
                                  <span className="neo-badge bg-[#FF7B70] text-[#171717] inline-flex items-center gap-1">
                                    <X className="w-3 h-3 stroke-[3]" /> MISMATCH
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FINDINGS & REASONS */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="bg-white border-2 border-[#171717] p-4 sm:p-5 space-y-2">
                    <h4 className="font-mono text-xs font-black uppercase text-[#171717] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#4169F5]" />
                      <span>FINDINGS & REASONS:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#222222] pl-4 list-disc font-medium">
                      {result.reasons.map((r, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* WHAT TO DO NEXT LINE */}
                <div className="bg-[#171717] text-white border-2 border-[#171717] p-4 sm:p-5 space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#F5E947] uppercase">
                    <ArrowRight className="w-4 h-4" />
                    <span>{language === 'pcm' ? 'WETIN YOU SUPPOSE DO NEXT:' : 'WHAT TO DO NEXT:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#EEEEEE] leading-relaxed">
                    {result.explanation?.action_recommendation || result.advice || 'Consult your pharmacist regarding packaging authenticity.'}
                  </p>
                </div>

                {/* METADATA DISCLAIMER FOOTER */}
                <div className="pt-2 border-t-2 border-[#171717] flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-[#555555]">
                  <span>SOURCE: {result.dataset_metadata?.source || 'NAFDAC GREEN BOOK'}</span>
                  <span>DISCLAIMER: INFORMATIONAL REGULATORY CROSS-CHECK ONLY</span>
                </div>

              </div>
            );
          })()}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setCheckError(null);
              }}
              className="neo-btn-primary px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>CHECK ANOTHER MEDICINE</span>
            </button>

            {photoPreview && (
              <button
                type="button"
                onClick={handleClearImage}
                className="neo-btn-secondary px-5 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>RETAKE PHOTO</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
