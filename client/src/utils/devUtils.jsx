import React from "react";

// Development utility to help catch common import/runtime issues
// This can be imported in development mode to add extra safety checks

export const devUtils = {
  // Check if all required icons are imported
  validateIcons: (component, requiredIcons = []) => {
    if (process.env.NODE_ENV !== "development") return;

    requiredIcons.forEach((iconName) => {
      if (typeof window[iconName] === "undefined") {
        console.warn(
          `🚨 Missing icon import: ${iconName} in component ${
            component.name || "Unknown"
          }`
        );
      }
    });
  },

  // Safe array access helper
  safeArray: (arr, fallback = []) => {
    return Array.isArray(arr) ? arr : fallback;
  },

  // Safe object access helper
  safeGet: (obj, path, defaultValue = null) => {
    try {
      return path.split(".").reduce((current, key) => {
        return current && current[key] !== undefined
          ? current[key]
          : defaultValue;
      }, obj);
    } catch (error) {
      console.warn("🚨 Safe get error:", error.message);
      return defaultValue;
    }
  },

  // Component error wrapper
  withErrorHandling: (Component, fallback = null) => {
    return function WrappedComponent(props) {
      try {
        return <Component {...props} />;
      } catch (error) {
        console.error("🚨 Component error:", error);
        return fallback || <div>Error loading component</div>;
      }
    };
  },

  // Development-only component validator
  validateComponent: (componentName, props = {}) => {
    if (process.env.NODE_ENV !== "development") return;

    console.group(`🔍 Component Validation: ${componentName}`);
    console.log("Props received:", props);

    // Check for common prop issues
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined) {
        console.warn(`⚠️  Prop "${key}" is undefined`);
      }
      if (value === null) {
        console.info(`ℹ️  Prop "${key}" is null`);
      }
    });

    console.groupEnd();
  },

  // Runtime error reporter
  reportError: (error, context = {}) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error("🚨 Runtime Error Report:", errorReport);

    // In production, you could send this to an error reporting service
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorService(errorReport);
    // }
  },
};

// Export individual utilities for convenience
export const {
  safeArray,
  safeGet,
  withErrorHandling,
  validateComponent,
  reportError,
} = devUtils;

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error, context) => {
    devUtils.reportError(error, context);
  };

  return { handleError };
};

// Default export
export default devUtils;
