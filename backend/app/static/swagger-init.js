// Custom Swagger UI initialization with pre-filled credentials
window.onload = function() {
  // Build a system
  const ui = SwaggerUIBundle({
    url: "/api/v1/openapi.json",
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
    onComplete: function() {
      // Pre-fill the authorization form
      setTimeout(() => {
        // Try to find and click the Authorize button
        const authBtn = document.querySelector('.btn.authorize');
        if (authBtn) {
          authBtn.click();
          
          // Wait for the modal to open
          setTimeout(() => {
            // Find username and password fields
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            
            if (usernameInput && passwordInput) {
              usernameInput.value = 'jane.doe@example.com';
              passwordInput.value = 'secret';
              
              // Trigger change events
              usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, 500);
        }
      }, 1000);
    }
  });

  window.ui = ui;
};