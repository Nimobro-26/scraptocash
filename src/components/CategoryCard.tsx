import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, Recycle, Cog, Smartphone } from 'lucide-react';

interface CategoryCardProps {
  category: 'paper' | 'plastic' | 'metal' | 'ewaste';
  selected: boolean;
  onClick: () => void;
}

const categoryInfo = {
  paper: {
    label: 'Paper',
    icon: FileText,
    color: 'from-amber-400 to-amber-600',
    rate: '₹12-18/kg',
  },
  plastic: {
    label: 'Plastic',
    icon: Recycle,
    color: 'from-blue-400 to-blue-600',
    rate: '₹8-15/kg',
  },
  metal: {
    label: 'Metal',
    icon: Cog,
    color: 'from-gray-400 to-gray-600',
    rate: '₹25-45/kg',
  },
  ewaste: {
    label: 'E-Waste',
    icon: Smartphone,
    color: 'from-purple-400 to-purple-600',
    rate: '₹50-200/kg',
  },
};

const CategoryCard = ({ category, selected, onClick }: CategoryCardProps) => {
  const info = categoryInfo[category];
  const Icon = info.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all duration-300 text-left w-full",
        selected
          ? "border-primary bg-accent shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white",
          info.color
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{info.label}</h3>
          <p className="text-xs text-muted-foreground">{info.rate}</p>
        </div>
      </div>
      
      {selected && (
        <motion.div
          layoutId="category-indicator"
          className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

export default CategoryCard;
