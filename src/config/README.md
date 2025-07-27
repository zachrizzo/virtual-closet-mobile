# API Configuration

## Updating the Backend IP Address

To change the backend server IP address, simply edit the `api.ts` file:

```typescript
export const API_CONFIG = {
  // Change this IP address to match your backend server
  BACKEND_IP: '192.168.1.117',  // <-- Update this line
  BACKEND_PORT: '8000',
  API_VERSION: 'api/v1',
};
```

## For Web Frontend

To update the web frontend API configuration, edit `web-frontend/config.js`:

```javascript
const API_CONFIG = {
  // Change this IP address to match your backend server
  BACKEND_IP: '192.168.1.117',  // <-- Update this line
  BACKEND_PORT: '8000',
};
```

## Usage

All API endpoints in the app will automatically use the configured IP address. No need to update multiple files!

### Mobile App
- The config is imported from `src/config/api.ts`
- Used by all API services and Redux RTK Query endpoints

### Web Frontend
- The config is loaded from `web-frontend/config.js`
- Available globally as `API_BASE_URL`