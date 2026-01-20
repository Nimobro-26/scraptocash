import { motion } from 'framer-motion';
import { Leaf, Heart } from 'lucide-react';
import logo from '@/assets/scrap2cash-logo.png';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-secondary text-secondary-foreground py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Scrap2Cash" className="h-8 w-auto brightness-0 invert" />
          </div>
          
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Leaf className="w-4 h-4 text-primary" />
            <span>Making sustainability rewarding</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm opacity-80">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>by</span>
            <span className="font-semibold text-primary">Team 7 Horse</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs opacity-60">
          © 2025 Scrap2Cash. All rights reserved. | Hackathon Demo
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
