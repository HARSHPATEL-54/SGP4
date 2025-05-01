import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoogleLogo from "@/components/GoogleLogo";
import { LoginInputState, userLoginSchema } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, LockKeyhole, Mail, ChefHat, ArrowRight } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [input, setInput] = useState<LoginInputState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginInputState>>({});
  const { loading, login, googleLogin, handleGoogleLoginSuccess } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for Google login success or error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleLoginSuccess = urlParams.get('googleLoginSuccess');
    const error = urlParams.get('error');
    
    if (googleLoginSuccess === 'true') {
      handleGoogleLoginSuccess();
      navigate('/');
    }
    
    if (error) {
      toast.error(decodeURIComponent(error));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, handleGoogleLoginSuccess, navigate]);

  const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };
  const loginSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    const result = userLoginSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<LoginInputState>);
      return;
    }
    try {
      await login(input);
      navigate("/");
    } catch (error) {console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-50">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-yellow-100 dark:bg-yellow-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md z-10 animate-fadeIn">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="pb-4 space-y-1">
            <div className="flex justify-center mb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300">
                <ChefHat size={32} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center text-orange-600 dark:text-orange-500">
              Foodista
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={loginSubmitHandler} className="space-y-4">
              <div className="space-y-1">
                <div className="relative group">
                  <Input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-orange-500 transition-all duration-200 rounded-lg"
                  />
                  <Mail className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                </div>
                {errors.email && (
                  <span className="text-xs font-medium text-red-500 pl-1 animate-slideDown">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={input.password}
                    onChange={changeEventHandler}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-orange-500 transition-all duration-200 rounded-lg"
                  />
                  <LockKeyhole className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                </div>
                {errors.password && (
                  <span className="text-xs font-medium text-red-500 pl-1 animate-slideDown">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div> */}

              {loading ? (
                <Button disabled className="w-full h-12 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium" style={{backgroundColor: 'rgb(234, 88, 12)'}}>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  style={{backgroundColor: 'rgb(234, 88, 12)'}}
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={() => googleLogin()} 
              variant="outline"
              className="w-full h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              style={{backgroundColor: '#ffffff', color: '#333333'}}
            >
              <GoogleLogo className="h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-medium text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;