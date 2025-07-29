#!/usr/bin/env python3
"""
Script to seed additional code snippets (utilities and algorithms).
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import SessionLocal
from app.db.models import CodeSnippet, User

def seed_additional_snippets():
    """Create additional utility and algorithm snippets."""
    
    db = SessionLocal()
    
    try:
        # Get system user
        system_user = db.query(User).filter(User.username == "system").first()
        if not system_user:
            print("❌ System user not found. Run seed_code_templates.py first.")
            return
        
        # Check if additional snippets already exist
        existing_utilities = db.query(CodeSnippet).filter(CodeSnippet.category == "utility").count()
        existing_algorithms = db.query(CodeSnippet).filter(CodeSnippet.category == "algorithm").count()
        
        if existing_utilities > 0 or existing_algorithms > 0:
            print(f"Additional snippets already exist (utilities: {existing_utilities}, algorithms: {existing_algorithms}). Skipping seed.")
            return
        
        # Utility snippets
        utilities = [
            {
                "title": "Array Utilities",
                "description": "Common array manipulation utilities",
                "code": """def find_max_subarray_sum(arr):
    \"\"\"Kadane's algorithm for maximum subarray sum\"\"\"
    max_sum = current_sum = arr[0]
    for num in arr[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum

def rotate_array(arr, k):
    \"\"\"Rotate array to the right by k steps\"\"\"
    k = k % len(arr)
    return arr[-k:] + arr[:-k]

def remove_duplicates(arr):
    \"\"\"Remove duplicates while preserving order\"\"\"
    seen = set()
    result = []
    for item in arr:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result""",
                "language": "python",
                "category": "utility",
                "tags": ["array", "utility", "kadane", "rotation"],
                "is_public": True
            },
            {
                "title": "String Utilities",
                "description": "Common string manipulation utilities",
                "code": """def is_palindrome(s):
    \"\"\"Check if string is palindrome (ignoring case and non-alphanumeric)\"\"\"
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

def longest_common_prefix(strs):
    \"\"\"Find longest common prefix among strings\"\"\"
    if not strs:
        return ""
    
    prefix = strs[0]
    for string in strs[1:]:
        while not string.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

def count_anagrams(word, text):
    \"\"\"Count anagrams of word in text\"\"\"
    from collections import Counter
    word_count = Counter(word)
    count = 0
    
    for i in range(len(text) - len(word) + 1):
        if Counter(text[i:i+len(word)]) == word_count:
            count += 1
    return count""",
                "language": "python",
                "category": "utility",
                "tags": ["string", "utility", "palindrome", "anagram"],
                "is_public": True
            },
            {
                "title": "Math Utilities",
                "description": "Common mathematical utilities for programming",
                "code": """def gcd(a, b):
    \"\"\"Greatest Common Divisor using Euclidean algorithm\"\"\"
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    \"\"\"Least Common Multiple\"\"\"
    return abs(a * b) // gcd(a, b)

def is_prime(n):
    \"\"\"Check if number is prime\"\"\"
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def fibonacci(n):
    \"\"\"Generate first n Fibonacci numbers\"\"\"
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib""",
                "language": "python",
                "category": "utility",
                "tags": ["math", "utility", "gcd", "prime", "fibonacci"],
                "is_public": True
            }
        ]
        
        # Algorithm snippets
        algorithms = [
            {
                "title": "Quick Sort Implementation",
                "description": "Efficient quicksort algorithm implementation",
                "code": """def quicksort(arr):
    \"\"\"Quick sort implementation\"\"\"
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

def quicksort_inplace(arr, low=0, high=None):
    \"\"\"In-place quicksort implementation\"\"\"
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pi = partition(arr, low, high)
        quicksort_inplace(arr, low, pi - 1)
        quicksort_inplace(arr, pi + 1, high)

def partition(arr, low, high):
    \"\"\"Partition function for quicksort\"\"\"
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1""",
                "language": "python",
                "category": "algorithm",
                "tags": ["sorting", "quicksort", "algorithm", "divide-conquer"],
                "is_public": True
            },
            {
                "title": "Merge Sort Implementation",
                "description": "Stable merge sort algorithm implementation",
                "code": """def merge_sort(arr):
    \"\"\"Merge sort implementation\"\"\"
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    \"\"\"Merge two sorted arrays\"\"\"
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result""",
                "language": "python",
                "category": "algorithm",
                "tags": ["sorting", "mergesort", "algorithm", "stable"],
                "is_public": True
            },
            {
                "title": "Dijkstra's Algorithm",
                "description": "Shortest path algorithm implementation",
                "code": """import heapq
from collections import defaultdict

def dijkstra(graph, start):
    \"\"\"Dijkstra's shortest path algorithm\"\"\"
    distances = defaultdict(lambda: float('inf'))
    distances[start] = 0
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_distance, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph[current]:
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return dict(distances)

# Example usage:
# graph = {
#     'A': [('B', 4), ('C', 2)],
#     'B': [('C', 1), ('D', 5)],
#     'C': [('D', 8), ('E', 10)],
#     'D': [('E', 2)],
#     'E': []
# }""",
                "language": "python",
                "category": "algorithm",
                "tags": ["graph", "shortest-path", "dijkstra", "algorithm"],
                "is_public": True
            },
            {
                "title": "LRU Cache Implementation",
                "description": "Least Recently Used cache with O(1) operations",
                "code": """class LRUCache:
    \"\"\"LRU Cache implementation using doubly linked list and hash map\"\"\"
    
    class Node:
        def __init__(self, key=0, val=0):
            self.key = key
            self.val = val
            self.prev = None
            self.next = None
    
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> node
        
        # Create dummy head and tail
        self.head = self.Node()
        self.tail = self.Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _add_node(self, node):
        \"\"\"Add node right after head\"\"\"
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node
    
    def _remove_node(self, node):
        \"\"\"Remove an existing node\"\"\"
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node
    
    def _move_to_head(self, node):
        \"\"\"Move node to head\"\"\"
        self._remove_node(node)
        self._add_node(node)
    
    def _pop_tail(self):
        \"\"\"Pop last node\"\"\"
        last_node = self.tail.prev
        self._remove_node(last_node)
        return last_node
    
    def get(self, key):
        node = self.cache.get(key)
        if not node:
            return -1
        
        # Move to head
        self._move_to_head(node)
        return node.val
    
    def put(self, key, value):
        node = self.cache.get(key)
        
        if not node:
            new_node = self.Node(key, value)
            
            if len(self.cache) >= self.capacity:
                # Remove tail
                tail = self._pop_tail()
                del self.cache[tail.key]
            
            self.cache[key] = new_node
            self._add_node(new_node)
        else:
            # Update value and move to head
            node.val = value
            self._move_to_head(node)""",
                "language": "python",
                "category": "algorithm",
                "tags": ["cache", "lru", "data-structure", "algorithm"],
                "is_public": True
            }
        ]
        
        # Create utility snippets
        for utility_data in utilities:
            utility = CodeSnippet(
                user_id=system_user.id,
                **utility_data
            )
            db.add(utility)
        
        # Create algorithm snippets
        for algorithm_data in algorithms:
            algorithm = CodeSnippet(
                user_id=system_user.id,
                **algorithm_data
            )
            db.add(algorithm)
        
        db.commit()
        print(f"✅ Successfully created {len(utilities)} utility snippets and {len(algorithms)} algorithm snippets")
        
        # List created snippets
        print("\nUtility Snippets:")
        for utility in db.query(CodeSnippet).filter(CodeSnippet.category == "utility").all():
            print(f"  - {utility.title}")
        
        print("\nAlgorithm Snippets:")
        for algorithm in db.query(CodeSnippet).filter(CodeSnippet.category == "algorithm").all():
            print(f"  - {algorithm.title}")
            
    except Exception as e:
        print(f"❌ Error seeding additional snippets: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_additional_snippets()