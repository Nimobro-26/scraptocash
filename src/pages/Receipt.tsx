import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Home, 
  TreePine, 
  Wind, 
  Recycle,
  Star,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressIndicator from '@/components/ProgressIndicator';
import AnimatedCounter from '@/components/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { useScrap } from '@/context/ScrapContext';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Price' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Payment' },
  { number: 5, label: 'Done' },
];

const Receipt = () => {
  const navigate = useNavigate();
  const { data, updateData, resetData } = useScrap();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (value: number) => {
    setRating(value);
    updateData({ executiveRating: value });
  };

  const handleBackToHome = () => {
    resetData();
    navigate('/');
  };

  // Calculate environmental impact (mock)
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);
  const treesSaved = Math.round(totalWeight * 0.3);
  const co2Reduced = Math.round(totalWeight * 2.5);

  // Redirect if no transaction
  if (!data.transactionId) {
    navigate('/sell');
    return null;
  }

  const timeLabels: Record<string, string> = {
    morning: '9:00 AM - 12:00 PM',
    afternoon: '12:00 PM - 4:00 PM',
    evening: '4:00 PM - 7:00 PM',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <ProgressIndicator currentStep={5} steps={steps} />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground">
                Your scrap pickup has been scheduled successfully.
              </p>
            </div>

            {/* Receipt Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl overflow-hidden mb-6"
            >
              {/* Receipt Header */}
              <div className="bg-primary p-4 text-primary-foreground text-center">
                <p className="text-sm opacity-80">Transaction ID</p>
                <p className="font-mono font-bold text-lg">{data.transactionId}</p>
              </div>

              {/* Receipt Details */}
              <div className="p-6 space-y-4">
                {/* Amount */}
                <div className="text-center pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-4xl font-bold text-primary">₹{data.estimatedPrice}</p>
                </div>

                {/* Items */}
                <div className="py-4 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Items Sold</h3>
                  <div className="space-y-2">
                    {data.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="capitalize text-foreground">{item.category}</span>
                        <span className="text-muted-foreground">{item.weight.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup Details */}
                <div className="py-4 border-b border-border space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Schedule</p>
                      <p className="font-medium text-foreground">
                        {data.pickupDate && format(data.pickupDate, 'EEEE, MMMM do, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {timeLabels[data.pickupTime]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {data.pickupType === 'pickup' ? 'Pickup Address' : 'Drop-off Location'}
                      </p>
                      <p className="font-medium text-foreground">
                        {data.pickupType === 'pickup' ? data.location : 'Scrap2Cash Center, Powai'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-foreground capitalize">
                        {data.paymentMethod === 'upi' ? 'UPI Transfer' : 'Cash on Pickup'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="py-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
                    Rate Your Experience
                  </h3>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRating(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            (hoverRating || rating) >= value
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm text-primary mt-2"
                    >
                      Thanks for your feedback!
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Environmental Impact */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-eco-gradient rounded-2xl p-6 mb-8 text-white"
            >
              <h3 className="text-lg font-semibold text-center mb-6">
                🌍 Your Environmental Impact
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <TreePine className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={treesSaved} />
                  </div>
                  <p className="text-xs opacity-80">Trees Saved</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <Recycle className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={Math.round(totalWeight)} suffix="kg" />
                  </div>
                  <p className="text-xs opacity-80">Recycled</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    <AnimatedCounter value={co2Reduced} suffix="kg" />
                  </div>
                  <p className="text-xs opacity-80">CO₂ Reduced</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                variant="outline"
                className="flex-1 py-6 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-6 rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </motion.div>

            <Button
              size="lg"
              onClick={handleBackToHome}
              className="w-full mt-4 py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Receipt;
