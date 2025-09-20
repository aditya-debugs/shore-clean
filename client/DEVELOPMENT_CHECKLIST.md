# Development Checklist - Preventing Runtime Errors

## Pre-commit Checklist

### 1. Import/Export Validation

- [ ] Check all lucide-react icon imports match the icons used in components
- [ ] Verify all React Router hooks (useNavigate, useParams, etc.) are imported
- [ ] Ensure all custom components are properly imported
- [ ] Check that all utility functions are imported where used

### 2. Component Validation

- [ ] Verify all JSX elements have proper opening/closing tags
- [ ] Check that all props are properly destructured or accessed
- [ ] Ensure all event handlers are properly bound
- [ ] Validate all conditional rendering has fallbacks

### 3. Data Handling

- [ ] Use optional chaining (?.) for nested object access
- [ ] Use logical OR (||) for array safety: `(array || []).map()`
- [ ] Add null/undefined checks before calling methods
- [ ] Implement proper error boundaries for components

### 4. Common Icon Import Patterns

```jsx
// ✅ Good: Import all icons you use
import {
  Calendar,
  Users,
  MapPin,
  Trash2, // Don't forget this one!
  Edit3,
  Save,
  X,
} from "lucide-react";

// ❌ Bad: Missing imports lead to ReferenceError
<Trash2 className="h-4 w-4" />; // Trash2 not imported
```

### 5. Safe Array/Object Access

```jsx
// ✅ Good: Safe array access
{(events || []).map(event => (
  <div key={event._id}>{event.title}</div>
))}

// ✅ Good: Optional chaining
{organization?.name || 'Unknown Organization'}

// ❌ Bad: Unsafe access
{events.map(event => ...)}  // Crashes if events is null/undefined
```

### 6. Error Boundary Best Practices

- [ ] Wrap main App component in ErrorBoundary
- [ ] Add ErrorBoundary around complex components
- [ ] Include meaningful error messages for users
- [ ] Log errors to console in development mode

### 7. Development Tools

- [ ] Use ESLint to catch unused imports
- [ ] Enable TypeScript strict mode for better type checking
- [ ] Use React Developer Tools for debugging
- [ ] Test components in isolation

### 8. Testing Checklist

- [ ] Test all major user flows (login, registration, event creation)
- [ ] Verify all pages load without console errors
- [ ] Check responsive design on different screen sizes
- [ ] Test with empty/loading states

### 9. Common Runtime Error Patterns to Avoid

```jsx
// ❌ These patterns cause runtime errors:

// 1. Missing icon imports
<SomeIcon className="h-4 w-4" />  // SomeIcon not imported

// 2. Unsafe array access
{data.map(item => ...)}  // data might be null

// 3. Missing null checks
{user.profile.name}  // user or profile might be null

// 4. Incorrect hook usage
const navigate = useNavigate();  // Missing import

// 5. Undefined variables
console.log(someVariable);  // someVariable not declared
```

### 10. Quick Fix Commands

```bash
# Check for unused imports
npm run lint

# Build to catch compilation errors
npm run build

# Run in development mode with hot reload
npm run dev
```

## Emergency Fix Protocol

If a runtime error occurs:

1. **Identify the Error**

   - Check browser console for exact error message
   - Note the file and line number
   - Look for "ReferenceError", "TypeError", etc.

2. **Common Quick Fixes**

   - Add missing import statements
   - Add null/undefined checks
   - Use optional chaining for object access
   - Add array safety with `|| []`

3. **Test the Fix**

   - Refresh the page to verify error is gone
   - Test the affected functionality
   - Check for any new errors in console

4. **Prevent Recurrence**
   - Update this checklist if needed
   - Add the pattern to your linting rules
   - Document the fix for team knowledge

## Code Quality Tools Setup

```json
// .eslintrc.js
{
  "rules": {
    "no-unused-vars": "error",
    "no-undef": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  }
}
```
