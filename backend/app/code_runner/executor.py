import subprocess
import tempfile
import os
import json
import time
import signal
from typing import Dict, Any, Optional, Tuple
import resource

class CodeExecutor:
    def __init__(self, timeout: int = 5, memory_limit_mb: int = 128):
        self.timeout = timeout
        self.memory_limit_mb = memory_limit_mb
    
    def execute_python_code(self, code: str, input_data: str) -> Dict[str, Any]:
        """
        Execute Python code with given input and return results.
        
        Args:
            code: Python code to execute
            input_data: Input data for the code
            
        Returns:
            Dict containing execution results
        """
        start_time = time.time()
        
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
            process = subprocess.Popen(
                ['python3', tmp_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=limit_memory
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
                        'error': None,
                        'execution_time': execution_time,
                        'memory_usage': self._estimate_memory_usage(process.pid)
                    }
                else:
                    return {
                        'success': False,
                        'output': None,
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
        
        return False
    
    def run_test_case(self, code: str, test_input: str, expected_output: str) -> Dict[str, Any]:
        """
        Run a single test case and return the result.
        
        Args:
            code: Python code to execute
            test_input: Input for the test case
            expected_output: Expected output
            
        Returns:
            Dict containing test case result
        """
        execution_result = self.execute_python_code(code, test_input)
        
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
    
    def run_all_test_cases(self, code: str, test_cases: list) -> Dict[str, Any]:
        """
        Run code against all test cases and return comprehensive results.
        
        Args:
            code: Python code to execute
            test_cases: List of test cases with input and output
            
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
                test_case['output']
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