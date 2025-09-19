// Strong password validation utility
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonAlphas = /\W/.test(password);
  const hasNoSpace = !/\s/.test(password);
  
  const errors = [];
  const requirements = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
    requirements.push({ text: `At least ${minLength} characters`, met: false });
  } else {
    requirements.push({ text: `At least ${minLength} characters`, met: true });
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
    requirements.push({ text: 'One uppercase letter (A-Z)', met: false });
  } else {
    requirements.push({ text: 'One uppercase letter (A-Z)', met: true });
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
    requirements.push({ text: 'One lowercase letter (a-z)', met: false });
  } else {
    requirements.push({ text: 'One lowercase letter (a-z)', met: true });
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
    requirements.push({ text: 'One number (0-9)', met: false });
  } else {
    requirements.push({ text: 'One number (0-9)', met: true });
  }
  
  if (!hasNonAlphas) {
    errors.push('Password must contain at least one special character');
    requirements.push({ text: 'One special character (!@#$%^&*)', met: false });
  } else {
    requirements.push({ text: 'One special character (!@#$%^&*)', met: true });
  }
  
  if (!hasNoSpace) {
    errors.push('Password cannot contain spaces');
    requirements.push({ text: 'No spaces allowed', met: false });
  } else {
    requirements.push({ text: 'No spaces allowed', met: true });
  }
  
  const strength = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    errors,
    requirements,
    strength
  };
};

const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  
  // Bonus points
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5;
  if (/\d.*\d.*\d/.test(password)) score += 5;
  
  // Penalty for common patterns
  if (/123456|password|qwerty|abc123/i.test(password)) score -= 20;
  if (/(.)\1{2,}/.test(password)) score -= 10;
  
  score = Math.max(0, Math.min(100, score));
  
  if (score < 30) return { level: 'weak', color: 'red', text: 'Weak' };
  if (score < 60) return { level: 'medium', color: 'yellow', text: 'Medium' };
  if (score < 80) return { level: 'strong', color: 'green', text: 'Strong' };
  return { level: 'very-strong', color: 'green', text: 'Very Strong' };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: !isValid && email ? 'Please enter a valid email address' : null
  };
};

// Name validation
export const validateName = (name) => {
  const minLength = 2;
  const maxLength = 50;
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  
  const errors = [];
  
  if (!name || name.trim().length < minLength) {
    errors.push(`Name must be at least ${minLength} characters long`);
  }
  
  if (name && name.length > maxLength) {
    errors.push(`Name must be less than ${maxLength} characters`);
  }
  
  if (name && !nameRegex.test(name.trim())) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation helper
export const validateForm = (formData, fields) => {
  const errors = {};
  
  fields.forEach(field => {
    switch (field) {
      case 'name':
        const nameValidation = validateName(formData.name);
        if (!nameValidation.isValid) {
          errors.name = nameValidation.errors[0];
        }
        break;
        
      case 'email':
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
          errors.email = emailValidation.error || 'Email is required';
        }
        break;
        
      case 'password':
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors[0];
        }
        break;
        
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 'role':
        if (!formData.role) {
          errors.role = 'Please select a role';
        }
        break;
        
      default:
        break;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validatePassword,
  validateEmail,
  validateName,
  validateForm
};
