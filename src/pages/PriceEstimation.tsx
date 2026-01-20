import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressIndicator from '@/components/ProgressIndicator';
import AnimatedCounter from '@/components/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useScrap } from '@/context/ScrapContext';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Price' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Payment' },
  { number: 5, label: 'Done' },
];

const categoryLabels: Record<string, string> = {
  paper: '📄 Paper',
  plastic: '🥤 Plastic',
  metal: '🔩 Metal',
  ewaste: '📱 E-Waste',
};

const PriceEstimation = () => {
  const navigate = useNavigate();
  const { data } = useScrap();
  const [showPrice, setShowPrice] = useState(false);
  const [confidenceAnimated, setConfidenceAnimated] = useState(0);

  useEffect(() => {
    // Animate price reveal
    const timer = setTimeout(() => setShowPrice(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showPrice) {
      // Animate confidence score
      const interval = setInterval(() => {
        setConfidenceAnimated(prev => {
          if (prev >= data.confidenceScore) {
            clearInterval(interval);
            return data.confidenceScore;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showPrice, data.confidenceScore]);

  // Redirect if no data
  if (data.estimatedPrice === 0) {
    navigate('/sell');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <ProgressIndicator currentStep={2} steps={steps} />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium mb-4"
              >
                <Sparkles className="w-4 h-4" />
                AI Price Estimation
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Your Scrap Value
              </h1>
            </div>

            {/* Price Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card rounded-2xl p-8 mb-6"
            >
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">Estimated Price</p>
                <div className="text-5xl md:text-6xl font-bold text-primary">
                  {showPrice ? (
                    <AnimatedCounter value={data.estimatedPrice} prefix="₹" duration={1.5} />
                  ) : (
                    <span className="text-muted-foreground">...</span>
                  )}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    AI Confidence Score
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {confidenceAnimated}%
                  </span>
                </div>
                <Progress value={confidenceAnimated} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on current market rates and image analysis
                </p>
              </div>

              {/* Item Breakdown */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Item Breakdown</h3>
                <div className="space-y-3">
                  {data.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoryLabels[item.category]?.split(' ')[0]}</span>
                        <div>
                          <p className="font-medium text-foreground">
                            {categoryLabels[item.category]?.split(' ')[1]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ~{item.weight.toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">
                        ₹{Math.round(data.estimatedPrice / data.items.length)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Location Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-xl p-4 mb-8"
            >
              <p className="text-sm text-muted-foreground">Pickup Location</p>
              <p className="font-medium text-foreground">{data.location}</p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                variant="outline"
                onClick={() => navigate('/sell')}
                className="flex-1 py-6 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/schedule')}
                className="flex-1 py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90"
              >
                Schedule Pickup
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PriceEstimation;
