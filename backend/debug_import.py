import traceback
import sys

sys.path.append('.')

try:
    import main
except Exception as e:
    traceback.print_exc()
