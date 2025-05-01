//import './App.css'
import Login from './auth/Login'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Signup from './auth/Signup'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import VerifyEmail from './auth/VerifyEmail'
import HeroSection from './components/HeroSection'
import MainLayout from './layout/MainLayout'
import Profile from './components/Profile'
import SearchPage from './components/SearchPage'
import RestaurantDetail from './components/RestaurantDetail'
import Cart from './components/Cart'
import Restaurant from './admin/Restaurant'
import AddMenu from './admin/AddMenu'
import Orders from './admin/Orders'
import OrderStatus from "./components/OrderStatus";
import UserOrders from "./components/UserOrders";
import { useUserStore } from './store/useUserStore'
import { useEffect } from 'react'
import Loading from './components/Loading'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  if(isAuthenticated && user?.isVerified){
    return <Navigate to="/" replace/>
  }
  return children;
};

const AdminRoute = ({children}:{children:React.ReactNode}) => {
  const {user, isAuthenticated} = useUserStore();
  if(!isAuthenticated){
    return <Navigate to="/login" replace/>
  }
  if(!user?.admin){
    return <Navigate to="/" replace/>
  }

  return children;
}


const appRouter = createBrowserRouter([{
  path: '/',
  element: (
    <ProtectedRoutes>
      <MainLayout />
    </ProtectedRoutes>
  ),
  children: [
    {
      path: '/',
      element:<HeroSection/>
    },
    {
      path: '/profile',
      element:<Profile/>
    },
    {
      path: '/search/:text',
      element:<SearchPage/>
    },
    {
      path: '/restaurant/:id',
      element:<RestaurantDetail/>
    },
    {
      path: '/cart',
      element:<Cart/>
    },
    {
      path: '/order/status',
      element:<OrderStatus/>
    },
    {
      path: '/orders',
      element:<UserOrders/>
    },
    //admin from here
    {
      path: "/admin/restaurant",
      element:<AdminRoute><Restaurant /></AdminRoute>,
    },
    {
      path: "/admin/menu",
      element:<AdminRoute><AddMenu /></AdminRoute>,
    },
    {
      path: "/admin/orders",
      element:<AdminRoute><Orders /></AdminRoute>,
    },
  ]
},
{
  path: "/login",
  element:<AuthenticatedUser><Login /></AuthenticatedUser>,
},
{
  path: "/signup",
  element:<AuthenticatedUser><Signup /></AuthenticatedUser> ,
},
{
  path: "/forgot-password",
  element: <AuthenticatedUser><ForgotPassword /></AuthenticatedUser>,
},
{
  path: 'reset-password/:token',
  element: <ResetPassword />
},
{
  path: 'verify-email',
  element: <VerifyEmail />
},
])
function App() {
  // const initializeTheme = useThemeStore((state:any) => state.initializeTheme);
   const {checkAuthentication, isCheckingAuth, handleGoogleLoginSuccess} = useUserStore();
   
  // checking auth every time when page is loaded
   useEffect(()=>{
     checkAuthentication();
     
     // Check if this is a redirect from Google OAuth
     const urlParams = new URLSearchParams(window.location.search);
     const googleLoginSuccess = urlParams.get('googleLoginSuccess');
     
     if (googleLoginSuccess === 'true') {
       handleGoogleLoginSuccess();
       // Clean up URL
       window.history.replaceState({}, document.title, window.location.pathname);
     }
  },[checkAuthentication, handleGoogleLoginSuccess])

  if(isCheckingAuth) return <Loading/>

  return (
    <main>
      <RouterProvider router={appRouter}>

      </RouterProvider>
     
    </main>
    
    
  )
}

export default App
