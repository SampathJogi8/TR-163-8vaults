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
            "lineCount": len(content.splitlines())
        }

        def get_max_depth(node, current_depth):
            depths = [current_depth]
            for child in ast.iter_child_nodes(node):
                # Only increase depth for block-level structures
                if isinstance(child, (ast.If, ast.For, ast.While, ast.With, ast.Try, ast.FunctionDef, ast.ClassDef)):
                    depths.append(get_max_depth(child, current_depth + 1))
                else:
                    depths.append(get_max_depth(child, current_depth))
            return max(depths)

        metrics["maxNesting"] = get_max_depth(tree, 0)

        # Count functions
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
