import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudentAccount } from "../backend.d";
import { createActorWithConfig } from "../config";
import { useActor } from "../hooks/useActor";

const LOGO =
  "/assets/uploads/picsart_26-03-28_15-51-14-131-019d33f8-4bce-7532-85c1-75a35238e473-1.png";
const DARK_BLUE_BG = "#0a1628";
const HEADING_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565C0 0%, #e53935 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

interface LoginPageProps {
  onStudentSuccess: (student: StudentAccount) => void;
  onAdminSuccess: () => void;
  onBack: () => void;
  defaultTab?: "student" | "admin";
}

export default function LoginPage({
  onStudentSuccess,
  onAdminSuccess,
  onBack,
  defaultTab = "student",
}: LoginPageProps) {
  const { actor: actorMaybe } = useActor();
  const queryClient = useQueryClient();
  const actor = actorMaybe!;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Enter username and password");
      return;
    }
    setLoading(true);
    try {
      const ok = await actor.studentLogin(username, password);
      if (!ok) {
        toast.error("Invalid username or password");
        return;
      }
      const studentResult = await actor.getStudentProfileForLogin(
        username,
        password,
      );
      const student = Array.isArray(studentResult)
        ? studentResult[0]
        : studentResult;
      if (!student) {
        toast.error("Account not found");
        return;
      }
      if (!student.isActive) {
        toast.error("Account is inactive. Contact admin.");
        return;
      }
      localStorage.setItem(
        "student_auth",
        JSON.stringify({
          username,
          password,
          courseType: student.courseType,
          duration: student.duration,
          id: Number(student.id),
        }),
      );
      toast.success("Login successful!");
      onStudentSuccess(student);
    } catch {
      toast.error("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      toast.error("Enter admin username and password");
      return;
    }
    setLoading(true);
    try {
      const ok = await actor.adminPasswordLogin(adminUsername, adminPassword);
      if (ok) {
        // Generate or load persistent Ed25519 identity for admin
        let identity: Ed25519KeyIdentity;
        const stored = localStorage.getItem("admin_identity");
        if (stored) {
          identity = Ed25519KeyIdentity.fromJSON(stored);
        } else {
          identity = Ed25519KeyIdentity.generate();
          localStorage.setItem(
            "admin_identity",
            JSON.stringify(identity.toJSON()),
          );
        }
        // Create actor with admin identity and register principal
        const adminActor = await createActorWithConfig({
          agentOptions: { identity },
        });
        await adminActor.setAdminPrincipalByPassword(
          adminUsername,
          adminPassword,
        );
        // Invalidate actor query so useActor refetches with new identity
        queryClient.invalidateQueries({ queryKey: ["actor"] });
        toast.success("Admin login successful!");
        onAdminSuccess();
      } else {
        toast.error("Invalid admin username or password.");
      }
    } catch {
      toast.error("Admin login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.55 0.22 258)" }}
    >
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div
            className="px-8 py-6 text-center"
            style={{ background: DARK_BLUE_BG }}
          >
            <img
              src={LOGO}
              alt="Logo"
              className="h-16 w-auto object-contain mx-auto mb-3"
            />
            <h1 className="text-xl font-bold" style={HEADING_GRADIENT}>
              Aatchiyalan IAS Academy
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Student &amp; Admin Portal
            </p>
          </div>
          <div className="p-8">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger
                  value="student"
                  className="flex-1 flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" /> Student Login
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex-1 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Admin Login
                </TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 block text-black">
                      Username
                    </Label>
                    <Input
                      placeholder="Enter your username"
                      className="text-black placeholder:text-gray-500 bg-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 block text-black">
                      Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="text-black placeholder:text-gray-500 bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="admin">
                <form onSubmit={handleAdminPasswordLogin} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 block text-black">
                      Admin Username
                    </Label>
                    <Input
                      placeholder="Enter admin username"
                      className="text-black placeholder:text-gray-500 bg-white"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 block text-black">
                      Admin Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Enter admin password"
                      className="text-black placeholder:text-gray-500 bg-white"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold"
                  >
                    {loading ? "Logging in..." : "Admin Login"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
