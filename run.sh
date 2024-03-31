#!/bin/bash

if command -v python3 &>/dev/null; then
  python3 main.py
elif command -v python &>/dev/null; then
  python main.py
else
  echo "Python not found. Please install Python to run this script."
fi