from main import app
for r in app.routes:
    if hasattr(r, 'path'):
        methods = ",".join(list(r.methods)) if hasattr(r, 'methods') else ""
        print(f"{r.path} [{methods}]")
