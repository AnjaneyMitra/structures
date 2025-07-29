#!/usr/bin/env python3
"""
Script to seed the database with default code templates.
Run this after the code snippets tables are created.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base import SessionLocal, engine
from app.db.models import CodeSnippet, User, Base

def seed_templates():
    """Create initial code templates."""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if templates already exist
        existing_count = db.query(CodeSnippet).filter(CodeSnippet.category == "template").count()
        if existing_count > 0:
            print(f"Code templates already exist ({existing_count} found). Skipping seed.")
            return
        
        # Get or create a system user for templates
        system_user = db.query(User).filter(User.username == "system").first()
        if not system_user:
            system_user = User(
                username="system",
                email="system@dsa-app.com",
                is_admin=True,
                total_xp=0
            )
            db.add(system_user)
            db.commit()
            db.refresh(system_user)
        
        # Default code templates
        templates = [
            {
                "title": "Binary Search Template",
                "description": "Standard binary search implementation template",
                "code": """def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Target not found""",
                "language": "python",
                "category": "template",
                "tags": ["binary-search", "algorithm", "template"],
                "is_public": True
            },
            {
                "title": "DFS Template",
                "description": "Depth-First Search template for graphs and trees",
                "code": """def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(start)
    print(start)  # Process current node
    
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    
    return visited""",
                "language": "python",
                "category": "template",
                "tags": ["dfs", "graph", "tree", "template"],
                "is_public": True
            },
            {
                "title": "BFS Template",
                "description": "Breadth-First Search template using queue",
                "code": """from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        print(node)  # Process current node
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return visited""",
                "language": "python",
                "category": "template",
                "tags": ["bfs", "graph", "queue", "template"],
                "is_public": True
            },
            {
                "title": "Dynamic Programming Template",
                "description": "Basic DP template with memoization",
                "code": """def dp_solution(n, memo=None):
    if memo is None:
        memo = {}
    
    # Base case
    if n <= 1:
        return n
    
    # Check if already computed
    if n in memo:
        return memo[n]
    
    # Compute and store result
    memo[n] = dp_solution(n-1, memo) + dp_solution(n-2, memo)
    return memo[n]""",
                "language": "python",
                "category": "template",
                "tags": ["dp", "dynamic-programming", "memoization", "template"],
                "is_public": True
            },
            {
                "title": "Two Pointers Template",
                "description": "Two pointers technique template",
                "code": """def two_pointers(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []  # No solution found""",
                "language": "python",
                "category": "template",
                "tags": ["two-pointers", "array", "template"],
                "is_public": True
            },
            {
                "title": "Sliding Window Template",
                "description": "Sliding window technique template",
                "code": """def sliding_window(arr, k):
    if not arr or k <= 0:
        return []
    
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(k, len(arr)):
        # Slide the window
        window_sum = window_sum - arr[i-k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum""",
                "language": "python",
                "category": "template",
                "tags": ["sliding-window", "array", "template"],
                "is_public": True
            },
            {
                "title": "Trie Data Structure",
                "description": "Basic Trie implementation template",
                "code": """class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_word = True
    
    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_word""",
                "language": "python",
                "category": "template",
                "tags": ["trie", "data-structure", "template"],
                "is_public": True
            },
            {
                "title": "Union Find Template",
                "description": "Union-Find (Disjoint Set) data structure template",
                "code": """class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        
        # Union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True""",
                "language": "python",
                "category": "template",
                "tags": ["union-find", "disjoint-set", "data-structure", "template"],
                "is_public": True
            }
        ]
        
        # Create templates
        for template_data in templates:
            template = CodeSnippet(
                user_id=system_user.id,
                **template_data
            )
            db.add(template)
        
        db.commit()
        print(f"✅ Successfully created {len(templates)} code templates")
        
        # List created templates
        for template in db.query(CodeSnippet).filter(CodeSnippet.category == "template").all():
            print(f"  - {template.title} ({template.language})")
            
    except Exception as e:
        print(f"❌ Error seeding templates: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_templates()