import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, CheckCircle2, Loader2, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressIndicator from '@/components/ProgressIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScrap } from '@/context/ScrapContext';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Price' },
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Payment' },
  { number: 5, label: 'Done' },
];

const Payment = () => {
  const navigate = useNavigate();
  const { data, updateData } = useScrap();
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleUpiPay = () => {
    setShowOtp(true);
    // Auto-fill OTP after 2 seconds for demo
    setTimeout(() => {
      setOtp(['4', '2', '8', '7']);
    }, 2000);
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length !== 4) return;
    
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      // Generate transaction ID
      const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
      updateData({
        paymentMethod,
        transactionId: txnId,
      });
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#15803d'],
      });
      
      // Navigate after celebration
      setTimeout(() => navigate('/receipt'), 2000);
    }, 2000);
  };

  const handleCashPayment = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      const txnId = 'COD' + Date.now().toString(36).toUpperCase();
      updateData({
        paymentMethod: 'cash',
        transactionId: txnId,
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#15803d'],
      });
      
      setTimeout(() => navigate('/receipt'), 2000);
    }, 1500);
  };

  // Redirect if no scheduling data
  if (!data.pickupDate) {
    navigate('/sell');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <ProgressIndicator currentStep={4} steps={steps} />
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8 text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Payment Successful!
                </h2>
                <p className="text-muted-foreground">
                  Redirecting to your receipt...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Payment
                </h1>
                <p className="text-muted-foreground mb-8">
                  Choose how you'd like to receive your payment.
                </p>

                {/* Amount Display */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-card rounded-2xl p-6 mb-8 text-center"
                >
                  <p className="text-sm text-muted-foreground mb-1">You'll receive</p>
                  <p className="text-4xl font-bold text-primary">
                    ₹{data.estimatedPrice}
                  </p>
                </motion.div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setPaymentMethod('upi');
                        setShowOtp(false);
                        setOtp(['', '', '', '']);
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        paymentMethod === 'upi'
                          ? "border-primary bg-accent"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Smartphone className={cn(
                          "w-8 h-8",
                          paymentMethod === 'upi' ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-semibold text-foreground">UPI</span>
                        <span className="text-xs text-muted-foreground">Instant transfer</span>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setPaymentMethod('cash');
                        setShowOtp(false);
                        setOtp(['', '', '', '']);
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        paymentMethod === 'cash'
                          ? "border-primary bg-accent"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Banknote className={cn(
                          "w-8 h-8",
                          paymentMethod === 'cash' ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-semibold text-foreground">Cash</span>
                        <span className="text-xs text-muted-foreground">On pickup</span>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* UPI Flow */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'upi' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {!showOtp ? (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="glass-card rounded-xl p-6 mb-8"
                        >
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-8" />
                          </div>
                          <p className="text-center text-sm text-muted-foreground mb-4">
                            Your linked UPI ID
                          </p>
                          <div className="bg-muted rounded-lg p-3 text-center font-mono text-foreground">
                            user@upi
                          </div>
                          <Button
                            onClick={handleUpiPay}
                            className="w-full mt-4 bg-primary hover:bg-primary/90"
                          >
                            <Smartphone className="w-4 h-4 mr-2" />
                            Pay via UPI
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="glass-card rounded-xl p-6 mb-8"
                        >
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-primary" />
                            <span className="font-medium text-foreground">OTP Verification</span>
                          </div>
                          <p className="text-center text-sm text-muted-foreground mb-6">
                            Enter the 4-digit OTP sent to your phone
                          </p>
                          
                          <div className="flex justify-center gap-3 mb-6">
                            {otp.map((digit, index) => (
                              <Input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                className="w-14 h-14 text-center text-2xl font-bold"
                              />
                            ))}
                          </div>

                          <Button
                            onClick={handleVerifyOtp}
                            disabled={otp.join('').length !== 4 || isVerifying}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              'Verify & Complete'
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {paymentMethod === 'cash' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="glass-card rounded-xl p-6 mb-8"
                      >
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <Banknote className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-center text-muted-foreground mb-4">
                          You'll receive <span className="font-bold text-foreground">₹{data.estimatedPrice}</span> in cash when our executive picks up your scrap.
                        </p>
                        <Button
                          onClick={handleCashPayment}
                          disabled={isVerifying}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm Cash Payment'
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment powered by Scrap2Cash</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
