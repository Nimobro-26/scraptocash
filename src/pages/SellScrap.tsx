import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, X, Image as ImageIcon, Loader2, ScanSearch, Camera } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressIndicator from '@/components/ProgressIndicator';
import CategoryCard from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useScrap } from '@/context/ScrapContext';
import { useToast } from '@/hooks/use-toast';
import { 
  locationSchema, 
  sanitizeText,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES
} from '@/lib/validation';
import { calculatePrice } from '@/lib/api';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Price' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Payment' },
  { number: 5, label: 'Done' },
];

const SellScrap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, updateData, data } = useScrap();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [weight, setWeight] = useState([5]);
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_FILES - uploadedImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      toast({ title: 'Maximum files reached', description: `You can upload up to ${MAX_FILES} images.`, variant: 'destructive' });
      return;
    }

    const validFiles: File[] = [];
    filesToProcess.forEach(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE) return;
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages].slice(0, MAX_FILES));
    } else {
      toast({ title: 'Invalid files', description: 'Use JPG, PNG, WebP, or GIF under 5MB.', variant: 'destructive' });
    }
  }, [uploadedImages.length, toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate files before processing
    const remainingSlots = MAX_FILES - uploadedImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) {
      toast({
        title: 'Maximum files reached',
        description: `You can upload up to ${MAX_FILES} images.`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    filesToProcess.forEach((file, index) => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid type. Use JPG, PNG, WebP, or GIF.`);
        return;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`File ${index + 1}: Too large. Max size is 5MB.`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: 'Some files were rejected',
        description: errors.join(' '),
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages].slice(0, MAX_FILES));
    }
    
    // Reset input to allow re-uploading same file
    e.target.value = '';
  }, [uploadedImages.length, toast]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Mock addresses for demo mode reverse geocoding
  const mockAddresses = [
    'Andheri West, Mumbai - 400053',
    'Bandra East, Mumbai - 400051',
    'Powai, Mumbai - 400076',
    'Malad West, Mumbai - 400064',
    'Goregaon East, Mumbai - 400063',
    'Thane West, Thane - 400601',
    'Borivali West, Mumbai - 400092',
  ];

  const getMockAddress = (lat: number, lng: number): string => {
    // Use coordinates to deterministically pick an address
    const index = Math.abs(Math.floor((lat + lng) * 1000)) % mockAddresses.length;
    return mockAddresses[index];
  };

  const detectLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast({
        title: 'Browser not supported',
        description: 'Your browser does not support location detection. Please enter manually.',
        variant: 'destructive',
      });
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Mock reverse geocoding with realistic delay
        setTimeout(() => {
          const address = getMockAddress(latitude, longitude);
          setLocation(address);
          setIsDetectingLocation(false);
          toast({
            title: 'Location detected!',
            description: 'We found your current location.',
          });
        }, 800);
      },
      (error) => {
        // For demo mode: auto-fill with mock address when permission denied
        // This makes the feature work in sandboxed environments like Lovable preview
        const fallbackAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
        setLocation(fallbackAddress);
        setIsDetectingLocation(false);
        
        let toastMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toastMessage = 'Permission denied - using demo location instead.';
            break;
          case error.POSITION_UNAVAILABLE:
            toastMessage = 'Location unavailable - using demo location instead.';
            break;
          case error.TIMEOUT:
            toastMessage = 'Request timed out - using demo location instead.';
            break;
          default:
            toastMessage = 'Using demo location for preview.';
        }
        
        toast({
          title: 'Demo location set',
          description: toastMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input to remove potential XSS vectors
    const sanitized = sanitizeText(e.target.value);
    setLocation(sanitized);
  };

  const handleGetEstimate = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: 'Select category',
        description: 'Please select at least one scrap category.',
        variant: 'destructive',
      });
      return;
    }

    // Validate location with Zod schema
    const locationResult = locationSchema.safeParse(location);
    if (!locationResult.success) {
      toast({
        title: 'Invalid location',
        description: locationResult.error.errors[0]?.message || 'Please enter a valid location.',
        variant: 'destructive',
      });
      return;
    }

    // Validate weight is within bounds
    if (weight[0] < 1 || weight[0] > 50) {
      toast({
        title: 'Invalid weight',
        description: 'Weight must be between 1 and 50 kg.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    // Add items to context
    selectedCategories.forEach(category => {
      addItem({
        category: category as 'paper' | 'plastic' | 'metal' | 'ewaste',
        weight: weight[0] / selectedCategories.length,
        imageUrl: uploadedImages[0],
      });
    });

    updateData({ location });

    // Call server-side price calculation
    try {
      const result = await calculatePrice({
        categories: selectedCategories,
        weight: weight[0],
      });

      updateData({
        estimatedPrice: result.estimatedPrice,
        confidenceScore: result.confidenceScore,
      });

      setIsAnalyzing(false);
      navigate('/estimate');
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: 'Error calculating price',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <ProgressIndicator currentStep={1} steps={steps} />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Sell Your Scrap
            </h1>
            <p className="text-muted-foreground mb-8">
              Upload photos and tell us about your scrap items.
            </p>

            {/* Image Upload with Drag & Drop */}
            <div
              className="mb-8"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <label className="block text-sm font-medium text-foreground mb-3">
                Upload Photos (Optional)
              </label>
              <div className={`relative grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl p-3 transition-all duration-200 ${isDragging ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 rounded-2xl bg-primary/10 border-2 border-dashed border-primary flex flex-col items-center justify-center backdrop-blur-sm"
                    >
                      <Upload className="w-10 h-10 text-primary mb-2" />
                      <span className="text-sm font-medium text-primary">Drop images here</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="popLayout">
                  {uploadedImages.map((img, index) => (
                    <motion.div
                      key={img}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                    >
                      <label className="cursor-pointer block w-full h-full">
                        <img src={img} alt="Scrap" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg mb-1"
                          >
                            <ScanSearch className="w-5 h-5 text-primary-foreground" />
                          </motion.div>
                          <span className="text-xs font-medium text-white/90 drop-shadow">Tap to replace</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                              toast({ title: 'Invalid file type', variant: 'destructive' });
                              return;
                            }
                            if (file.size > MAX_FILE_SIZE) {
                              toast({ title: 'File too large (max 5MB)', variant: 'destructive' });
                              return;
                            }
                            setUploadedImages(prev => prev.map((img, i) => i === index ? URL.createObjectURL(file) : img));
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {uploadedImages.length < 4 && (
                  <div className="grid grid-cols-2 gap-3 col-span-2 sm:col-span-2">
                    {/* Camera Capture */}
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="aspect-square rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
                    >
                      <Camera className="w-8 h-8 text-primary mb-2" />
                      <span className="text-xs font-medium text-primary">Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </motion.label>

                    {/* File Upload */}
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent transition-all"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </motion.label>
                  </div>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Scrap Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['paper', 'plastic', 'metal', 'ewaste'] as const).map(category => (
                  <CategoryCard
                    key={category}
                    category={category}
                    selected={selectedCategories.includes(category)}
                    onClick={() => handleCategoryToggle(category)}
                  />
                ))}
              </div>
            </div>

            {/* Weight Estimate */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Estimated Weight: <span className="text-primary font-semibold">{weight[0]} kg</span>
              </label>
              <Slider
                value={weight}
                onValueChange={setWeight}
                max={50}
                min={1}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 kg</span>
                <span>50 kg</span>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Pickup Location
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Enter your address"
                    maxLength={200}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="shrink-0 min-w-[100px]"
                >
                  {isDetectingLocation ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                      </motion.div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Detect
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              onClick={handleGetEstimate}
              disabled={isAnalyzing}
              className="w-full py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Get AI Price Estimate
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellScrap;
