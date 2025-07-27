from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import auth, users, clothing, outfits, recommendations
import os

app = FastAPI(
    title="Virtual Closet API",
    description="AI-powered wardrobe management and styling API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = "app/data/uploads"
os.makedirs(uploads_dir, exist_ok=True)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(clothing.router, prefix="/api/v1/clothing", tags=["Clothing"])
app.include_router(outfits.router, prefix="/api/v1/outfits", tags=["Outfits"])
app.include_router(recommendations.router, prefix="/api/v1/ai", tags=["AI & Recommendations"])

@app.get("/")
async def root():
    return {"message": "Virtual Closet API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/docs", response_class=HTMLResponse, include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI with pre-filled test credentials"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
        <link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png">
        <title>{app.title} - Swagger UI</title>
        <style>
        .swagger-ui .topbar {{
            display: none;
        }}
        .auth-wrapper {{
            background: #e7f3ff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #4990e2;
        }}
        .auth-wrapper h3 {{
            margin: 0 0 10px 0;
            color: #2c5282;
        }}
        .auth-wrapper p {{
            margin: 5px 0;
            color: #2d3748;
        }}
        </style>
    </head>
    <body>
        <div class="swagger-ui">
            <div class="auth-wrapper">
                <h3>🔐 Test Credentials Pre-filled</h3>
                <p><strong>Username:</strong> jane.doe@example.com</p>
                <p><strong>Password:</strong> secret</p>
                <p>Click the <strong>Authorize</strong> button below and then click <strong>Authorize</strong> in the popup to login.</p>
            </div>
        </div>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {{
            const ui = SwaggerUIBundle({{
                url: '{app.openapi_url}',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                onComplete: function() {{
                    // Pre-fill credentials when Authorize button is clicked
                    document.addEventListener('click', function(e) {{
                        if (e.target.classList.contains('authorize') || 
                            e.target.closest('.btn.authorize')) {{
                            setTimeout(() => {{
                                const usernameInput = document.querySelector('input[name="username"]');
                                const passwordInput = document.querySelector('input[name="password"]');
                                
                                if (usernameInput && passwordInput) {{
                                    usernameInput.value = 'jane.doe@example.com';
                                    passwordInput.value = 'secret';
                                    
                                    // Trigger input events
                                    const event = new Event('input', {{ bubbles: true }});
                                    usernameInput.dispatchEvent(event);
                                    passwordInput.dispatchEvent(event);
                                }}
                            }}, 200);
                        }}
                    }});
                }}
            }});
            window.ui = ui;
        }};
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)