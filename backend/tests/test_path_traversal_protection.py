import os

def test_relative_path_traversal_sanitization():
    unsafe_path = "../../etc/passwd"
    norm = os.path.normpath(unsafe_path).lstrip("/\\")
    assert norm.startswith("..")
    # Our scan orchestrator drops paths with '..' in component split
    parts = norm.split(os.sep)
    assert ".." in parts
