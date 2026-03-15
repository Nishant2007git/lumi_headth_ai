from fastapi import HTTPException, status

class LumiBaseException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class AuthenticationError(LumiBaseException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class UserAlreadyExistsError(LumiBaseException):
    def __init__(self, message: str = "User with this email already exists"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)

class NotFoundError(LumiBaseException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class InternalServerError(LumiBaseException):
    def __init__(self, message: str = "An unexpected error occurred"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
