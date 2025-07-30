#!/usr/bin/env python3
"""
Script to seed the database with sample code snippets for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import SessionLocal
from app.db.models import CodeSnippet, User
from sqlalchemy.orm import Session

def seed_sample_snippets():
    """Create sample code snippets for testing."""
    db = SessionLocal()
    try:
        # Check if snippets already exist
        existing_count = db.query(CodeSnippet).count()
        if existing_count > 0:
            print(f"✅ Sample snippets already exist ({existing_count} found). Skipping seed.")
            return
        
        # Get the first user (or create one if needed)
        user = db.query(User).first()
        if not user:
            print("❌ No users found. Please create a user first.")
            return
        
        print(f"🌱 Seeding sample snippets for user: {user.username}")
        
        # Sample snippets data
        sample_snippets = [
            {
                "title": "Python Hello World",
                "description": "A simple Python hello world program",
                "code": 'print("Hello, World!")',
                "language": "python",
                "category": "template",
                "tags": "beginner,hello-world",
                "is_public": True
            },
            {
                "title": "JavaScript Array Methods",
                "description": "Common JavaScript array manipulation methods",
                "code": """const numbers = [1, 2, 3, 4, 5];

// Map - transform each element
const doubled = numbers.map(x => x * 2);

// Filter - keep only elements that match condition
const evens = numbers.filter(x => x % 2 === 0);

// Reduce - combine all elements into single value
const sum = numbers.reduce((acc, x) => acc + x, 0);

console.log(doubled); // [2, 4, 6, 8, 10]
console.log(evens);   // [2, 4]
console.log(sum);     // 15""",
                "language": "javascript",
                "category": "utility",
                "tags": "arrays,methods,functional",
                "is_public": True
            },
            {
                "title": "Java Binary Search",
                "description": "Binary search algorithm implementation in Java",
                "code": """public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Not found
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13, 15};
        int target = 7;
        int result = binarySearch(arr, target);
        System.out.println("Index: " + result);
    }
}""",
                "language": "java",
                "category": "algorithm",
                "tags": "binary-search,algorithm,search",
                "is_public": True
            },
            {
                "title": "C++ Vector Operations",
                "description": "Common C++ vector operations and methods",
                "code": """#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> vec = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // Sort the vector
    std::sort(vec.begin(), vec.end());
    
    // Find an element
    auto it = std::find(vec.begin(), vec.end(), 5);
    if (it != vec.end()) {
        std::cout << "Found 5 at position: " << (it - vec.begin()) << std::endl;
    }
    
    // Add elements
    vec.push_back(8);
    vec.insert(vec.begin(), 0);
    
    // Print all elements
    for (int num : vec) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}""",
                "language": "cpp",
                "category": "utility",
                "tags": "vector,stl,containers",
                "is_public": True
            },
            {
                "title": "TypeScript Interface Example",
                "description": "TypeScript interfaces and type definitions",
                "code": """interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    tags: string[];
    publishedAt?: Date;
}

// Function with type safety
function createPost(post: Omit<Post, 'id' | 'publishedAt'>): Post {
    return {
        ...post,
        id: Math.floor(Math.random() * 1000),
        publishedAt: new Date()
    };
}

// Usage
const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    createdAt: new Date()
};

const post = createPost({
    title: "TypeScript Best Practices",
    content: "TypeScript provides excellent type safety...",
    author: user,
    tags: ["typescript", "programming"]
});

console.log(post);""",
                "language": "typescript",
                "category": "template",
                "tags": "typescript,interfaces,types",
                "is_public": True
            }
        ]
        
        # Create snippets
        created_snippets = []
        for snippet_data in sample_snippets:
            snippet = CodeSnippet(
                user_id=user.id,
                title=snippet_data["title"],
                description=snippet_data["description"],
                code=snippet_data["code"],
                language=snippet_data["language"],
                category=snippet_data["category"],
                tags=snippet_data["tags"],
                is_public=snippet_data["is_public"]
            )
            db.add(snippet)
            created_snippets.append(snippet)
        
        db.commit()
        print(f"✅ Successfully created {len(created_snippets)} sample snippets")
        
        # List created snippets
        for snippet in created_snippets:
            print(f"  - {snippet.title} ({snippet.language})")
        
    except Exception as e:
        print(f"❌ Error seeding snippets: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_snippets() 