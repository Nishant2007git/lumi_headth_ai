from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password = "password123"
try:
    h = pwd_context.hash(password)
    print(f"Hash successful: {h}")
except Exception as e:
    print(f"Error: {e}")
