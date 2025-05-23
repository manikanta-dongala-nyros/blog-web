import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const lastPath = useAuthStore((state) => state.lastPath);
  const setLastPath = useAuthStore((state) => state.setLastPath);
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to prevent immediate redirection during initial load
    const timer = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = window.location.pathname;
        // Don't save login page as last path
        if (currentPath !== '/login') {
          setLastPath(currentPath);
        }
        router.push('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router, setLastPath]);

  // Show loading state while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
