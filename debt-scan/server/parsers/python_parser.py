import sys
import ast
import json

def analyze_python(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        tree = ast.parse(content)
        
        metrics = {
            "functionCount": 0,
            "maxNesting": 0,
            "avgFunctionLength": 0,
            "lineCount": len(content.splitlines())
        }

        # Count functions and classes
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                metrics["functionCount"] += 1

        return metrics
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = analyze_python(sys.argv[1])
        print(json.dumps(result))
