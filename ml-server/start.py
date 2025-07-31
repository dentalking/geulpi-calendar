#!/usr/bin/env python3

import os
import sys
import subprocess
from pathlib import Path

def main():
    """
    Start the ML server with proper configuration
    """
    # Ensure we're in the correct directory
    os.chdir(Path(__file__).parent)
    
    # Check if virtual environment exists
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Virtual environment not found. Creating one...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        
        # Activate virtual environment and install dependencies
        if os.name == "nt":  # Windows
            pip_path = venv_path / "Scripts" / "pip"
            python_path = venv_path / "Scripts" / "python"
        else:  # Unix/Linux/Mac
            pip_path = venv_path / "bin" / "pip"
            python_path = venv_path / "bin" / "python"
        
        print("Installing dependencies...")
        subprocess.run([str(pip_path), "install", "-r", "requirements.txt"], check=True)
    else:
        if os.name == "nt":  # Windows
            python_path = venv_path / "Scripts" / "python"
        else:  # Unix/Linux/Mac
            python_path = venv_path / "bin" / "python"
    
    # Start the FastAPI server
    print("Starting ML server...")
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd())
    
    subprocess.run([
        str(python_path), "-m", "uvicorn", 
        "app.main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ], env=env)

if __name__ == "__main__":
    main()