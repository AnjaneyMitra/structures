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
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self._initialized = True
    
    def generate_contextual_hint(self, problem_title: str, problem_description: str, user_code: str, language: str, reference_solution: Optional[str] = None, additional_context: str = "") -> str:
        """
        Generate a contextual hint for a coding problem based on the user's current code.
        Returns a single hint tailored to their current approach and progress.
        """
        try:
            # Ensure Gemini is initialized
            self._ensure_initialized()
            
            # Create a contextual prompt for hint generation
            prompt = self._create_contextual_hint_prompt(problem_title, problem_description, user_code, language, reference_solution, additional_context)
            
            # Generate hint using Gemini
            response = self.model.generate_content(prompt)
            
            # Clean and return the hint
            hint = response.text.strip()
            
            # If the hint is too long, truncate it
            if len(hint) > 500:
                hint = hint[:497] + "..."
            
            return hint if hint else self._get_fallback_contextual_hint()
            
        except Exception as e:
            logger.error(f"Error generating contextual hint with Gemini: {str(e)}")
            # Return fallback hint if Gemini fails
            return self._get_fallback_contextual_hint()
    
    def generate_hints(self, problem_title: str, problem_description: str, reference_solution: Optional[str] = None) -> List[str]:
        """
        Generate static hints for a coding problem (fallback for when no user code is available).
        Returns a list of 3 hints in order of increasing helpfulness.
        """
        try:
            # Ensure Gemini is initialized
            self._ensure_initialized()
            
            # Create a comprehensive prompt for hint generation
            prompt = self._create_static_hint_prompt(problem_title, problem_description, reference_solution)
            
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
    
    def _create_contextual_hint_prompt(self, title: str, description: str, user_code: str, language: str, reference_solution: Optional[str] = None, additional_context: str = "") -> str:
        """Create a detailed prompt for Gemini to generate a contextual hint based on user's current code."""
        
        # Analyze the code to provide better context
        code_analysis = self._analyze_user_code(user_code, language)
        
        base_prompt = f"""
You are an expert coding mentor providing personalized guidance to a student. Your role is to analyze their specific code and provide targeted, actionable advice.

PROBLEM CONTEXT:
Title: {title}
Description: {description}

STUDENT'S CURRENT CODE ({language}):
```{language}
{user_code}
```

CODE ANALYSIS:
{code_analysis}

HINT GENERATION RULES:
1. **Be Specific**: Address the exact issues in their current code, not generic advice
2. **Be Progressive**: Assume this might be one of multiple hints - build on their current progress
3. **Be Actionable**: Give concrete next steps they can immediately implement
4. **Be Educational**: Explain the "why" behind your suggestion when helpful
5. **Be Encouraging**: Acknowledge what they're doing right before suggesting improvements
6. **Be Unique**: If this seems like a repeat request, provide a different angle or focus area
7. **Be Contextual**: Use the specific analysis of their code to provide targeted guidance

ANALYSIS FRAMEWORK:
- What is the student trying to accomplish with their current code?
- What specific bugs, inefficiencies, or logical errors exist?
- What's the most important next step for them to take?
- Are they missing a key algorithmic insight?
- Do they need help with syntax, logic, or approach?

RESPONSE FORMAT:
Provide exactly ONE focused hint that addresses their most pressing current issue. Make it specific to their code, not a generic programming tip.

"""
        
        if reference_solution:
            base_prompt += f"""
OPTIMAL SOLUTION (for your reference only - DO NOT reveal this):
```{language}
{reference_solution}
```

Use this to understand the target approach and guide the student toward it progressively.
"""
        
        if additional_context:
            base_prompt += f"""
ADDITIONAL CONTEXT:
{additional_context}
"""
        
        base_prompt += """
Generate your specific, actionable hint now:
"""
        
        return base_prompt
    
    def _analyze_user_code(self, user_code: str, language: str) -> str:
        """Analyze the user's code to provide better context for hint generation."""
        analysis = []
        
        # Basic code structure analysis
        lines = user_code.strip().split('\n')
        non_empty_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
        
        if len(non_empty_lines) == 0:
            analysis.append("- Code is empty or contains only comments")
        elif len(non_empty_lines) <= 2:
            analysis.append("- Very minimal code - likely just function definition or basic structure")
        elif len(non_empty_lines) <= 5:
            analysis.append("- Basic implementation started - has some logic but likely incomplete")
        else:
            analysis.append("- Substantial code written - implementation is in progress")
        
        # Language-specific analysis
        if language.lower() == 'python':
            if 'def ' in user_code:
                analysis.append("- Function definition present")
            if 'for ' in user_code or 'while ' in user_code:
                analysis.append("- Contains loops - iterative approach being used")
            if 'if ' in user_code:
                analysis.append("- Contains conditional logic")
            if 'return' in user_code:
                analysis.append("- Has return statement(s)")
            else:
                analysis.append("- Missing return statement - function may not return anything")
            if user_code.count('for') > 1:
                analysis.append("- Multiple loops detected - possibly nested iteration")
        
        elif language.lower() == 'javascript':
            if 'function' in user_code or '=>' in user_code:
                analysis.append("- Function definition present")
            if 'for' in user_code or 'while' in user_code:
                analysis.append("- Contains loops - iterative approach being used")
            if 'if' in user_code:
                analysis.append("- Contains conditional logic")
            if 'return' in user_code:
                analysis.append("- Has return statement(s)")
            else:
                analysis.append("- Missing return statement - function may not return anything")
        
        # Common patterns and approaches
        if '[]' in user_code or 'Array' in user_code:
            analysis.append("- Working with arrays/lists")
        if '{}' in user_code or 'Object' in user_code or 'dict' in user_code:
            analysis.append("- Working with objects/dictionaries - possibly using hash map approach")
        if 'sort' in user_code.lower():
            analysis.append("- Using sorting approach - consider if this is necessary")
        if 'len(' in user_code or '.length' in user_code:
            analysis.append("- Checking lengths/sizes")
        if 'range(' in user_code:
            analysis.append("- Using range-based iteration")
        if 'enumerate' in user_code:
            analysis.append("- Using enumerate for index-value pairs")
        if 'zip(' in user_code:
            analysis.append("- Using zip for parallel iteration")
        if 'set(' in user_code or 'Set' in user_code:
            analysis.append("- Using set data structure - good for uniqueness/lookup")
        if 'min(' in user_code or 'max(' in user_code:
            analysis.append("- Finding minimum/maximum values")
        if 'sum(' in user_code:
            analysis.append("- Calculating sums")
        if 'append(' in user_code or 'push(' in user_code:
            analysis.append("- Building result by appending elements")
        if 'pop(' in user_code:
            analysis.append("- Using stack-like operations")
        if 'split(' in user_code:
            analysis.append("- String manipulation with split")
        if 'join(' in user_code:
            analysis.append("- String construction with join")
        
        # Algorithm patterns
        if user_code.count('for') >= 2:
            analysis.append("- PATTERN: Nested loops detected - O(n²) complexity, consider if optimization needed")
        if 'while' in user_code and 'for' in user_code:
            analysis.append("- PATTERN: Mixed iteration types - ensure termination conditions are correct")
        if 'recursive' in user_code.lower() or user_code.count('def ') > 1:
            analysis.append("- PATTERN: Possibly using recursion")
        if 'dp' in user_code.lower() or 'memo' in user_code.lower():
            analysis.append("- PATTERN: Dynamic programming or memoization approach")
        
        # Potential issues
        if user_code.count('(') != user_code.count(')'):
            analysis.append("- ISSUE: Mismatched parentheses")
        if user_code.count('[') != user_code.count(']'):
            analysis.append("- ISSUE: Mismatched brackets")
        if user_code.count('{') != user_code.count('}'):
            analysis.append("- ISSUE: Mismatched braces")
        
        return '\n'.join(analysis) if analysis else "- Basic code structure"
    
    def _create_static_hint_prompt(self, title: str, description: str, reference_solution: Optional[str] = None) -> str:
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
    
    def _get_fallback_contextual_hint(self) -> str:
        """Return a generic fallback hint for contextual requests."""
        return "Review your current approach and consider if there's a more efficient way to solve this problem. Think about edge cases and test your logic step by step."

# Global instance
gemini_hint_generator = GeminiHintGenerator()