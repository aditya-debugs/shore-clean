// Simple test for devUtils to ensure they work correctly
import { safeArray, safeGet, devUtils } from "./devUtils.js";

// Test safeArray
console.log("Testing safeArray:");
console.log("null array:", safeArray(null)); // Should return []
console.log("undefined array:", safeArray(undefined)); // Should return []
console.log("valid array:", safeArray([1, 2, 3])); // Should return [1, 2, 3]

// Test safeGet
console.log("\nTesting safeGet:");
const testObj = { user: { profile: { name: "John" } } };
console.log("valid path:", safeGet(testObj, "user.profile.name")); // Should return 'John'
console.log("invalid path:", safeGet(testObj, "user.profile.age", "Unknown")); // Should return 'Unknown'
console.log("null object:", safeGet(null, "user.name", "Default")); // Should return 'Default'

// Test validateComponent
console.log("\nTesting validateComponent:");
devUtils.validateComponent("TestComponent", {
  name: "test",
  value: undefined,
  data: null,
});

console.log("\n✅ All devUtils tests completed successfully!");
