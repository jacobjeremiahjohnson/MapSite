import { useAuth } from "react-oidc-context";

function SignIn() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "vg11qjm5t5cgm2dtiga48h47u";
    const logoutUri = import.meta.env.VITE_REDIRECT_URI;
    const cognitoDomain = "https://us-east-1ibdkjbrvb.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
        <p>"Have you been here before?"</p>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default SignIn;