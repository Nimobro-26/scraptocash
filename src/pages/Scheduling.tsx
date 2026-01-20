import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Truck, Building, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressIndicator from '@/components/ProgressIndicator';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScrap } from '@/context/ScrapContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Price' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Payment' },
  { number: 5, label: 'Done' },
];

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', time: '4:00 PM - 7:00 PM', icon: '🌆' },
];

const Scheduling = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, updateData } = useScrap();
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [pickupType, setPickupType] = useState<'pickup' | 'dropoff'>('pickup');

  const handleConfirm = () => {
    if (!date) {
      toast({
        title: 'Select date',
        description: 'Please select a pickup date.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: 'Select time',
        description: 'Please select a time slot.',
        variant: 'destructive',
      });
      return;
    }

    updateData({
      pickupDate: date,
      pickupTime: selectedTime,
      pickupType,
    });

    navigate('/payment');
  };

  // Redirect if no price data
  if (data.estimatedPrice === 0) {
    navigate('/sell');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <ProgressIndicator currentStep={3} steps={steps} />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Schedule Pickup
            </h1>
            <p className="text-muted-foreground mb-8">
              Choose when and how you'd like us to collect your scrap.
            </p>

            {/* Pickup Type */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Collection Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPickupType('pickup')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    pickupType === 'pickup'
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      pickupType === 'pickup' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Home Pickup</h3>
                      <p className="text-xs text-muted-foreground">We'll come to you</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPickupType('dropoff')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    pickupType === 'dropoff'
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      pickupType === 'dropoff' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Drop-off</h3>
                      <p className="text-xs text-muted-foreground">Visit our center</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-6 rounded-xl",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    {date ? format(date, "EEEE, MMMM do, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Select Time Slot
              </label>
              <div className="grid gap-3">
                {timeSlots.map((slot) => (
                  <motion.button
                    key={slot.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedTime(slot.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between",
                      selectedTime === slot.id
                        ? "border-primary bg-accent"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{slot.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{slot.label}</h3>
                        <p className="text-sm text-muted-foreground">{slot.time}</p>
                      </div>
                    </div>
                    {selectedTime === slot.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                      >
                        <span className="text-primary-foreground text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Location Display */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-4 mb-8"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {pickupType === 'pickup' ? 'Pickup Address' : 'Drop-off Location'}
                  </p>
                  <p className="font-medium text-foreground">
                    {pickupType === 'pickup' ? data.location : 'Scrap2Cash Center, Powai, Mumbai'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Confirm Button */}
            <Button
              size="lg"
              onClick={handleConfirm}
              className="w-full py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90"
            >
              Confirm Booking
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scheduling;
