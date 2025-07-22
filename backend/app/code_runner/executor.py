import subprocess
import tempfile
import os
import json
import time
import signal
from typing import Dict, Any, Optional, Tuple
import resource
import platform

class CodeExecutor:
    def __init__(self, timeout: int = 5, memory_limit_mb: int = 128):
        self.timeout = timeout
        self.memory_limit_mb = memory_limit_mb
    
    def execute_python_code(self, code: str, input_data: str = "") -> Dict[str, Any]:
        """
        Execute Python code with given input and return results.
        This method executes code directly without function wrapping.
        
        Args:
            code: Python code to execute
            input_data: Input data for the code
            
        Returns:
            Dict containing execution results
        """
        start_time = time.time()
        tmp_file_path = None
        
        try:
            # Create temporary file for the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp_file:
                tmp_file.write(code)
                tmp_file_path = tmp_file.name
            
            # Set up process with resource limits
            def limit_memory():
                """Limit memory usage"""
                resource.setrlimit(resource.RLIMIT_AS, (self.memory_limit_mb * 1024 * 1024, -1))
            
            # Execute the code
            use_preexec = platform.system() == 'Linux'
            process = subprocess.Popen(
                ['python3', tmp_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=limit_memory if use_preexec else None
            )
            
            try:
                # Send input and wait for completion
                stdout, stderr = process.communicate(
                    input=input_data,
                    timeout=self.timeout
                )
                
                execution_time = time.time() - start_time
                
                # Check if process completed successfully
                if process.returncode == 0:
                    return {
                        'success': True,
                        'output': stdout.strip(),
                        'error': stderr.strip() if stderr.strip() else None,
                        'execution_time': execution_time,
                        'memory_usage': self._estimate_memory_usage(process.pid)
                    }
                else:
                    return {
                        'success': False,
                        'output': stdout.strip() if stdout.strip() else None,
                        'error': stderr.strip() or 'Runtime error occurred',
                        'execution_time': execution_time,
                        'memory_usage': self._estimate_memory_usage(process.pid)
                    }
                    
            except subprocess.TimeoutExpired:
                # Kill the process if it times out
                process.kill()
                process.wait()
                return {
                    'success': False,
                    'output': None,
                    'error': f'Execution timed out after {self.timeout} seconds',
                    'execution_time': self.timeout,
                    'memory_usage': 0
                }
                
        except Exception as e:
            return {
                'success': False,
                'output': None,
                'error': f'Execution error: {str(e)}',
                'execution_time': time.time() - start_time,
                'memory_usage': 0
            }
        finally:
            # Clean up temporary file
            try:
                if tmp_file_path:
                    os.unlink(tmp_file_path)
            except:
                pass
    
    def execute_python_function(self, user_code: str, function_name: str, input_args: str) -> Dict[str, Any]:
        """
        Execute a user-defined function with given input arguments.
        Args:
            user_code: The user's function code as a string.
            function_name: The name of the function to call.
            input_args: The arguments for the function as a string (comma/newline separated).
        Returns:
            Dict containing execution results (output, error, etc.)
        """
        start_time = time.time()
        tmp_file_path = None
        try:
            # Prepare the wrapper code that captures both function output and print statements
            wrapper_code = f"""
import sys
import json

{user_code}

def parse_input(input_str):
    # Try to parse as JSON first (handles lists, objects, etc.)
    try:
        parsed = json.loads(input_str)
        # If it's a list, return it as a single argument (the list itself)
        if isinstance(parsed, list):
            return [parsed]
        else:
            return [parsed]
    except:
        # If JSON parsing fails, try to parse as simple values
        lines = [line.strip() for line in input_str.strip().split('\\n') if line.strip()]
        if len(lines) == 1:
            # Single line input - could be space-separated or single value
            parts = [x.strip() for x in lines[0].split() if x.strip()]
            if len(parts) == 1:
                # Single value
                def try_num(x):
                    try:
                        return int(x)
                    except:
                        try:
                            return float(x)
                        except:
                            return x
                return [try_num(parts[0])]
            else:
                # Multiple space-separated values - return as list
                def try_num(x):
                    try:
                        return int(x)
                    except:
                        try:
                            return float(x)
                        except:
                            return x
                return [[try_num(x) for x in parts]]
        else:
            # Multiple lines - each line is a separate argument
            def try_num(x):
                try:
                    return int(x)
                except:
                    try:
                        return float(x)
                    except:
                        return x
            return [try_num(line) for line in lines]

if __name__ == "__main__":
    input_str = sys.stdin.read().strip()
    if input_str:
        args = parse_input(input_str)
        if not isinstance(args, list):
            args = [args]
    else:
        args = []
    
    try:
        # Check if the function exists
        if '{function_name}' not in globals():
            print("__EXCEPTION__Function '{function_name}' is not defined. Make sure you have a function named '{function_name}' in your code.", file=sys.stderr)
            sys.exit(1)
            
        result = {function_name}(*args)
        
        # Output the result directly
        if result is not None:
            if isinstance(result, (str, int, float, bool)):
                print(result)
            elif isinstance(result, (list, dict)):
                print(json.dumps(result))
            else:
                print(str(result))
        else:
            print("")
            
    except TypeError as error:
        if "takes" in str(error) and "positional argument" in str(error):
            print("__EXCEPTION__Function signature mismatch. Check that your solution function accepts the correct number of parameters for the given input.", file=sys.stderr)
        else:
            print("__EXCEPTION__" + str(error), file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        print("__EXCEPTION__" + str(error), file=sys.stderr)
        sys.exit(1)
"""
            # Write the wrapper code to a temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp_file:
                tmp_file.write(wrapper_code)
                tmp_file_path = tmp_file.name

            def limit_memory():
                resource.setrlimit(resource.RLIMIT_AS, (self.memory_limit_mb * 1024 * 1024, -1))

            use_preexec = platform.system() == 'Linux'
            process = subprocess.Popen(
                ['python3', tmp_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=limit_memory if use_preexec else None
            )
            try:
                stdout, stderr = process.communicate(
                    input=input_args,
                    timeout=self.timeout
                )
                execution_time = time.time() - start_time
                if process.returncode == 0:
                    return {
                        'success': True,
                        'output': stdout.strip(),
                        'error': None,
                        'execution_time': execution_time,
                        'memory_usage': self._estimate_memory_usage(process.pid)
                    }
                else:
                    # Check for our custom exception marker
                    if stderr and '__EXCEPTION__' in stderr:
                        error_msg = stderr.strip().split('__EXCEPTION__')[-1]
                    else:
                        error_msg = stderr.strip() or 'Runtime error occurred'
                    return {
                        'success': False,
                        'output': None,
                        'error': error_msg,
                        'execution_time': execution_time,
                        'memory_usage': self._estimate_memory_usage(process.pid)
                    }
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
                return {
                    'success': False,
                    'output': None,
                    'error': f'Execution timed out after {self.timeout} seconds',
                    'execution_time': self.timeout,
                    'memory_usage': 0
                }
        except Exception as ex:
            return {
                'success': False,
                'output': None,
                'error': f'Execution error: {str(ex)}',
                'execution_time': time.time() - start_time,
                'memory_usage': 0
            }
        finally:
            try:
                if tmp_file_path:
                    os.unlink(tmp_file_path)
            except:
                pass
    
    def _estimate_memory_usage(self, pid: int) -> float:
        """Estimate memory usage of the process in MB"""
        try:
            with open(f'/proc/{pid}/status', 'r') as f:
                for line in f:
                    if line.startswith('VmRSS:'):
                        memory_kb = int(line.split()[1])
                        return memory_kb / 1024.0  # Convert to MB
        except:
            pass
        return 0.0
    
    def validate_output(self, actual_output: str, expected_output: str) -> bool:
        """
        Compare actual output with expected output.
        Handles different data types and formats.
        """
        # Strip whitespace and normalize
        actual = actual_output.strip()
        expected = expected_output.strip()
        
        # Direct comparison
        if actual == expected:
            return True
        
        # Handle multi-line outputs by comparing line by line
        actual_lines = [line.strip() for line in actual.split('\n') if line.strip()]
        expected_lines = [line.strip() for line in expected.split('\n') if line.strip()]
        
        # If both have same number of lines, compare each line
        if len(actual_lines) == len(expected_lines):
            all_match = True
            for a_line, e_line in zip(actual_lines, expected_lines):
                if not self._compare_single_output(a_line, e_line):
                    all_match = False
                    break
            if all_match:
                return True
        
        # Try comparing the last line (function return value) if there are print statements
        if actual_lines and expected_lines:
            if self._compare_single_output(actual_lines[-1], expected_lines[-1]):
                return True
        
        # Fallback to single output comparison
        return self._compare_single_output(actual, expected)
    
    def _compare_single_output(self, actual: str, expected: str) -> bool:
        """Compare single line outputs with various type handling"""
        # Direct comparison
        if actual == expected:
            return True
        
        # Try to parse as JSON for array/list comparisons
        try:
            actual_json = json.loads(actual)
            expected_json = json.loads(expected)
            return actual_json == expected_json
        except:
            pass
        
        # Try to parse as numbers
        try:
            actual_num = float(actual)
            expected_num = float(expected)
            return abs(actual_num - expected_num) < 1e-9  # Small tolerance for floating point
        except:
            pass
        
        # Try to parse as boolean
        bool_map = {
            'true': True, 'false': False,
            'True': True, 'False': False,
            '1': True, '0': False
        }
        if actual in bool_map and expected in bool_map:
            return bool_map[actual] == bool_map[expected]
        
        # Handle list/array string representations
        try:
            # Remove brackets and spaces, then compare as comma-separated values
            actual_clean = actual.replace('[', '').replace(']', '').replace(' ', '')
            expected_clean = expected.replace('[', '').replace(']', '').replace(' ', '')
            if actual_clean == expected_clean:
                return True
        except:
            pass
        
        return False
    
    def run_test_case(self, code: str, test_input: str, expected_output: str, function_name: str = "solution") -> Dict[str, Any]:
        """
        Run a single test case and return the result.
        Args:
            code: Python code to execute
            test_input: Input for the test case
            expected_output: Expected output
            function_name: Name of the function to call in user code
        Returns:
            Dict containing test case result
        """
        execution_result = self.execute_python_function(code, function_name, test_input)
        if execution_result['success']:
            passed = self.validate_output(execution_result['output'], expected_output)
            return {
                'input': test_input,
                'expected': expected_output,
                'output': execution_result['output'],
                'passed': passed,
                'execution_time': execution_result['execution_time'],
                'error': None
            }
        else:
            return {
                'input': test_input,
                'expected': expected_output,
                'output': None,
                'passed': False,
                'execution_time': execution_result['execution_time'],
                'error': execution_result['error']
            }

    def run_all_test_cases(self, code: str, test_cases: list, function_name: str = "solution") -> Dict[str, Any]:
        """
        Run code against all test cases and return comprehensive results.
        Args:
            code: Python code to execute
            test_cases: List of test cases with input and output
            function_name: Name of the function to call in user code
        Returns:
            Dict containing all test case results
        """
        results = []
        total_time = 0
        passed_count = 0
        for test_case in test_cases:
            result = self.run_test_case(
                code,
                test_case['input'],
                test_case['output'],
                function_name
            )
            results.append(result)
            total_time += result['execution_time']
            if result['passed']:
                passed_count += 1
        # Determine overall status
        if passed_count == len(test_cases):
            overall_status = 'pass'
        elif passed_count == 0:
            overall_status = 'fail'
        else:
            overall_status = 'partial'
        return {
            'test_case_results': results,
            'total_test_cases': len(test_cases),
            'passed_test_cases': passed_count,
            'overall_status': overall_status,
            'total_execution_time': total_time,
            'average_execution_time': total_time / len(test_cases) if test_cases else 0
        } 