import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_IbdkjbRvb",
  client_id: "vg11qjm5t5cgm2dtiga48h47u",
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  scope: "email openid",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
)
