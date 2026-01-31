import { z } from 'zod';

// Location validation schema
export const locationSchema = z.string()
  .trim()
  .min(5, { message: "Location must be at least 5 characters" })
  .max(200, { message: "Location must be less than 200 characters" })
  .regex(/^[\p{L}\p{N}\s,.\-#/()]+$/u, { 
    message: "Location contains invalid characters" 
  });

// Weight validation schema
export const weightSchema = z.number()
  .min(1, { message: "Weight must be at least 1 kg" })
  .max(50, { message: "Weight cannot exceed 50 kg" });

// Category validation schema
export const categorySchema = z.enum(['paper', 'plastic', 'metal', 'ewaste']);

// OTP validation schema
export const otpSchema = z.string()
  .length(4, { message: "OTP must be 4 digits" })
  .regex(/^\d{4}$/, { message: "OTP must contain only numbers" });

// File validation constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES = 4;

// File validation function
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')}` 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }
  
  return { valid: true };
};

// Validate multiple files
export const validateImageFiles = (files: FileList): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (files.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed`);
    return { valid: false, errors };
  }
  
  Array.from(files).forEach((file, index) => {
    const result = validateImageFile(file);
    if (!result.valid && result.error) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

// Sanitize text input (removes potential XSS vectors)
export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Form validation for sell scrap page
export const sellScrapFormSchema = z.object({
  categories: z.array(categorySchema).min(1, { message: "Select at least one category" }),
  weight: weightSchema,
  location: locationSchema,
});

export type SellScrapFormData = z.infer<typeof sellScrapFormSchema>;
