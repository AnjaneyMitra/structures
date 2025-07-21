import pytest
from app.code_runner.executor import CodeExecutor

executor = CodeExecutor(timeout=2, memory_limit_mb=64)

PYTHON_PASS_CODE = """
def solution():
    return 42
if __name__ == "__main__":
    print(solution())
"""

PYTHON_FAIL_CODE = """
def solution():
    return 0
if __name__ == "__main__":
    print(solution())
"""

PYTHON_SYNTAX_ERROR = """
def solution()
    return 42
"""

def test_execute_python_code_success():
    result = executor.execute_python_code(PYTHON_PASS_CODE, "")
    print("SUCCESS TEST ERROR OUTPUT:", result['error'])
    assert result['success']
    assert result['output'] == '42'
    assert result['error'] is None

def test_execute_python_code_fail():
    result = executor.execute_python_code(PYTHON_FAIL_CODE, "")
    print("FAIL TEST ERROR OUTPUT:", result['error'])
    assert result['success']
    assert result['output'] == '0'

def test_execute_python_code_syntax_error():
    result = executor.execute_python_code(PYTHON_SYNTAX_ERROR, "")
    assert not result['success']
    assert 'SyntaxError' in (result['error'] or '')

def test_validate_output_exact():
    assert executor.validate_output('42', '42')
    assert not executor.validate_output('42', '43')

def test_validate_output_json():
    assert executor.validate_output('[1,2,3]', '[1,2,3]')
    assert not executor.validate_output('[1,2,3]', '[1,2,4]')

def test_validate_output_number():
    assert executor.validate_output('3.14', '3.14')
    assert executor.validate_output('3.140', '3.14')
    assert not executor.validate_output('3.14', '2.71')

def test_validate_output_bool():
    assert executor.validate_output('true', 'True')
    assert executor.validate_output('False', 'false')
    assert not executor.validate_output('true', 'false')

def test_run_test_case_pass():
    tc = executor.run_test_case(PYTHON_PASS_CODE, '', '42')
    assert tc['passed']
    assert tc['output'] == '42'

def test_run_test_case_fail():
    tc = executor.run_test_case(PYTHON_FAIL_CODE, '', '42')
    assert not tc['passed']
    assert tc['output'] == '0'

def test_run_test_case_syntax_error():
    tc = executor.run_test_case(PYTHON_SYNTAX_ERROR, '', '42')
    assert not tc['passed']
    assert tc['error'] is not None 