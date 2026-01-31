import { motion } from 'framer-motion';
import logo from '@/assets/scrap2cash-logo.png';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="Scrap2Cash" className="h-10 w-auto" />
        </a>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Impact
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
