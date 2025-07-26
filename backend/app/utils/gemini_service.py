import google.generativeai as genai
import os
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class GeminiHintGenerator:
    def __init__(self):
        self.model = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization of Gemini API."""
        if self._initialized:
            return
        
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self._initialized = True
    
    def generate_hints(self, problem_title: str, problem_description: str, reference_solution: Optional[str] = None) -> List[str]:
        """
        Generate progressive hints for a coding problem using Gemini AI.
        Returns a list of 3 hints in order of increasing helpfulness.
        """
        try:
            # Ensure Gemini is initialized
            self._ensure_initialized()
            # Create a comprehensive prompt for hint generation
            prompt = self._create_hint_prompt(problem_title, problem_description, reference_solution)
            
            # Generate hints using Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response to extract individual hints
            hints = self._parse_hints_response(response.text)
            
            # Ensure we have exactly 3 hints
            if len(hints) < 3:
                # If we got fewer hints, pad with generic ones
                while len(hints) < 3:
                    hints.append(f"Think about the problem step by step. Consider edge cases and optimal approaches.")
            elif len(hints) > 3:
                # If we got more hints, take the first 3
                hints = hints[:3]
            
            return hints
            
        except Exception as e:
            logger.error(f"Error generating hints with Gemini: {str(e)}")
            # Return fallback hints if Gemini fails
            return self._get_fallback_hints()
    
    def _create_hint_prompt(self, title: str, description: str, reference_solution: Optional[str] = None) -> str:
        """Create a detailed prompt for Gemini to generate progressive hints."""
        
        base_prompt = f"""
You are an expert coding instructor helping students solve programming problems. 
Generate exactly 3 progressive hints for the following coding problem.

Problem Title: {title}

Problem Description:
{description}

Requirements for hints:
1. Each hint should be on a separate line starting with "HINT X:" where X is the hint number
2. Hints should be progressive - each one more helpful than the last
3. Hint 1: Should be a gentle nudge about the general approach or key insight
4. Hint 2: Should provide more specific guidance about the algorithm or data structure to use
5. Hint 3: Should give detailed implementation guidance without giving away the complete solution
6. Keep each hint concise (1-2 sentences max)
7. Don't include actual code in the hints
8. Focus on helping the student think through the problem logically

"""
        
        if reference_solution:
            base_prompt += f"""
Reference Solution (for context only - don't reveal this):
{reference_solution}

Use this solution to understand the optimal approach and create hints that guide toward it.
"""
        
        base_prompt += """
Generate the 3 hints now:
"""
        
        return base_prompt
    
    def _parse_hints_response(self, response_text: str) -> List[str]:
        """Parse the Gemini response to extract individual hints."""
        hints = []
        lines = response_text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for lines that start with "HINT X:" pattern
            if line.startswith('HINT ') and ':' in line:
                # Extract the hint content after the colon
                hint_content = line.split(':', 1)[1].strip()
                if hint_content:
                    hints.append(hint_content)
        
        # If the parsing didn't work as expected, try alternative parsing
        if not hints:
            # Look for numbered hints in other formats
            for line in lines:
                line = line.strip()
                if line and (line.startswith('1.') or line.startswith('2.') or line.startswith('3.') or 
                           line.startswith('1)') or line.startswith('2)') or line.startswith('3)')):
                    # Remove the numbering and add to hints
                    hint_content = line[2:].strip()
                    if hint_content:
                        hints.append(hint_content)
        
        return hints
    
    def _get_fallback_hints(self) -> List[str]:
        """Return generic fallback hints if Gemini fails."""
        return [
            "Start by understanding the problem requirements and identifying the input/output format.",
            "Consider what data structures or algorithms might be most suitable for this type of problem.",
            "Think about the time and space complexity requirements, and implement step by step."
        ]

# Global instance
gemini_hint_generator = GeminiHintGenerator()