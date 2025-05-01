import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, LockKeyholeIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { token } = useParams<{ token: string }>();
    const { resetPassword, loading } = useUserStore();
    const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <form className="flex flex-col gap-5 md:p-8 w-full max-w-md rounded-lg mx-4">
        <div className="text-center">
          <h1 className="font-extrabold text-2xl mb-2">Reset Password</h1>
          <p className="text-sm text-gray-600">Enter your new password to reset old one</p>
        </div>
        <div className="relative w-full">
            <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            className="pl-10"
            />
            <LockKeyholeIcon className="absolute inset-y-2 left-2 text-gray-600 pointer-events-none"/>
        </div>
        <div className="relative w-full">
            <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="pl-10"
            />
            <LockKeyholeIcon className="absolute inset-y-2 left-2 text-gray-600 pointer-events-none"/>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {
            loading ? (
                <Button disabled className="bg-orange hover:bg-hoverOrange"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait</Button>
            ) : (
                <Button 
                    onClick={async (e: FormEvent) => {
                        e.preventDefault();
                        if (!token) {
                            toast.error("Invalid or missing token");
                            return;
                        }
                        
                        if (newPassword.length < 6) {
                            setError("Password must be at least 6 characters");
                            return;
                        }
                        
                        if (newPassword !== confirmPassword) {
                            setError("Passwords do not match");
                            return;
                        }
                        
                        try {
                            await resetPassword(token, newPassword);
                            toast.success("Password reset successful");
                            navigate("/login");
                        } catch (error) {
                            console.error("Password reset error:", error);
                        }
                    }} 
                    className="bg-orange hover:bg-hoverOrange"
                >
                    Reset Password
                </Button>
            )
        }
        <span className="text-center">
            Back to{" "}
            <Link to="/login" className="text-blue-500">Login</Link>
        </span>
      </form>
    </div>
  );
};

export default ResetPassword;