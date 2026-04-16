import sys
import javalang
import json

def analyze_java(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        tree = javalang.parse.parse(content)
        
        metrics = {
            "functionCount": 0,
            "maxNesting": 0,
            "avgFunctionLength": 0,
            "lineCount": len(content.splitlines())
        }

        # Count methods
        methods = []
        for path, node in tree.filter(javalang.tree.MethodDeclaration):
            methods.append(node)
            metrics["functionCount"] += 1

        # Complexity/Nesting (Simplified approximation via indent level is handled in Node, 
        # but here we can look at statement depth if we wanted to be precise)
        # For now, we contribute basic structural counts.
        
        return metrics
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = analyze_java(sys.argv[1])
        print(json.dumps(result))
