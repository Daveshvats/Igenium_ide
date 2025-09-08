# Example Problem: Two Sum

## Problem Description

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

## Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

## Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

## Skeleton Code (JavaScript):
```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};
```

## Skeleton Code (Python):
```python
def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your code here
    pass
```

## Test Cases:

### Test Case 1:
- **Input**: `[2,7,11,15]`, `9`
- **Expected Output**: `[0,1]`

### Test Case 2:
- **Input**: `[3,2,4]`, `6`
- **Expected Output**: `[1,2]`

### Test Case 3:
- **Input**: `[3,3]`, `6`
- **Expected Output**: `[0,1]`

### Test Case 4 (Hidden):
- **Input**: `[1,2,3,4,5]`, `8`
- **Expected Output**: `[2,4]`

### Test Case 5 (Hidden):
- **Input**: `[-1,-2,-3,-4,-5]`, `-8`
- **Expected Output**: `[2,4]`

## Scoring:
- **Base Points**: 100
- **Type**: General (both time and space optimization considered)
- **Time Limit**: 2000ms
- **Memory Limit**: 128MB

## Solution Approaches:

### Approach 1: Brute Force (O(n²) time, O(1) space)
```javascript
var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
};
```

### Approach 2: Hash Map (O(n) time, O(n) space)
```javascript
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};
```

## How to Add This Problem:

1. **Login as Admin**
2. **Go to Admin Panel**
3. **Click "Create New Problem"**
4. **Fill in the details:**
   - Title: "Two Sum"
   - Description: Copy the problem description above
   - Language: JavaScript (or Python)
   - Type: General
   - Skeleton Code: Copy the appropriate skeleton code
   - Points: 100
   - Time Limit: 2000
   - Memory Limit: 128

5. **Add Test Cases:**
   - Input: `[2,7,11,15]`, Expected Output: `[0,1]`
   - Input: `[3,2,4]`, Expected Output: `[1,2]`
   - Input: `[3,3]`, Expected Output: `[0,1]`
   - Input: `[1,2,3,4,5]`, Expected Output: `[2,4]` (Hidden)
   - Input: `[-1,-2,-3,-4,-5]`, Expected Output: `[2,4]` (Hidden)

6. **Save the Problem**

This example demonstrates the platform's capabilities for creating comprehensive coding problems with multiple test cases and different difficulty levels.
