import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  Facebook,
  FileText,
  Globe,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  Shield,
  Star,
  Trophy,
  Twitter,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StudentAccount } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import { useSubmitCounselingRequest } from "./hooks/useQueries";

const LOGO = "/assets/capture_thish-019d47e7-cd2c-760d-a0bb-042016f55730.jpg";
const DIRECTOR = "K. Karthik";
const DIRECTOR_QUALS = "MBA., M.A(Phil)., M.Phil";
const BRIGHT_BLUE = "oklch(0.55 0.22 258)";
const DARK_BLUE_BG = "#0a1628";
const WHATSAPP_NUMBER = "918680815762";

const HEADING_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565C0 0%, #e53935 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const CONTACT_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565C0 0%, #e53935 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

type AppView = "home" | "login" | "dashboard" | "admin";

// ── UTILITY BAR ──────────────────────────────────────────────────────────────
function UtilityBar() {
  return (
    <div
      className="text-white/80 text-xs py-2 px-4"
      style={{ background: DARK_BLUE_BG }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 text-gold" />
          <span>
            Helpline: <strong className="text-gold">+91 98949 93796</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Follow Us:</span>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-gold transition-colors"
          >
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-gold transition-colors"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:text-gold transition-colors"
          >
            <Youtube className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Classroom Coaching", href: "#coaching" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

function Navigation({
  currentStudent,
  isAdmin,
  onLoginClick,
  onDashboardClick,
  onAdminClick,
  onLogout,
}: {
  currentStudent: StudentAccount | null;
  isAdmin: boolean;
  onLoginClick: () => void;
  onDashboardClick: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCounseling = () => {
    setMobileOpen(false);
    document
      .getElementById("counseling")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : ""}`}
      style={{ background: DARK_BLUE_BG }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <a
          href="#home"
          className="flex items-center gap-3 group"
          data-ocid="nav.link"
        >
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-white">
            <img
              src={LOGO}
              alt="Aatchiyalan IAS Academy Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">
              Aatchiyalan IAS Academy
            </span>
            <span className="text-gold text-xs font-semibold leading-tight">
              Director: {DIRECTOR}
            </span>
            <span className="text-white/50 text-[10px] leading-tight">
              {DIRECTOR_QUALS}
            </span>
          </div>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-white/80 hover:text-gold text-sm font-medium px-3 py-2 rounded transition-colors duration-200"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            {currentStudent ? (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  type="button"
                  onClick={onDashboardClick}
                  className="bg-gold hover:bg-gold-dark text-white font-semibold text-sm px-4 py-2 h-9"
                >
                  My Portal
                </Button>
                <Button
                  type="button"
                  onClick={onLogout}
                  variant="ghost"
                  className="text-white/70 hover:text-white text-sm h-9"
                >
                  Logout
                </Button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  type="button"
                  onClick={onAdminClick}
                  className="bg-gold hover:bg-gold-dark text-white font-semibold text-sm px-4 py-2 h-9 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel
                </Button>
                <Button
                  type="button"
                  onClick={onLogout}
                  variant="ghost"
                  className="text-white/70 hover:text-white text-sm h-9"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  type="button"
                  onClick={onLoginClick}
                  variant="ghost"
                  className="text-white/80 hover:text-gold text-sm font-medium px-3 py-2 h-9 flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Student Login
                </Button>
                <Button
                  type="button"
                  onClick={scrollToCounseling}
                  className="bg-gold hover:bg-gold-dark text-white font-semibold text-sm px-4 py-2 h-9"
                  data-ocid="nav.primary_button"
                >
                  Enroll Now
                </Button>
              </div>
            )}
          </li>
        </ul>

        <button
          type="button"
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-white/10 overflow-hidden"
            style={{ background: DARK_BLUE_BG }}
          >
            <ul className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-white/80 hover:text-gold text-sm font-medium py-2 transition-colors"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2 flex flex-col gap-2">
                {currentStudent ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onDashboardClick();
                      }}
                      className="w-full bg-gold hover:bg-gold-dark text-white font-semibold"
                    >
                      My Portal
                    </Button>
                    <Button
                      type="button"
                      onClick={onLogout}
                      variant="outline"
                      className="w-full text-white border-white/30"
                    >
                      Logout
                    </Button>
                  </>
                ) : isAdmin ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onAdminClick();
                      }}
                      className="w-full bg-gold hover:bg-gold-dark text-white font-semibold"
                    >
                      Admin Panel
                    </Button>
                    <Button
                      type="button"
                      onClick={onLogout}
                      variant="outline"
                      className="w-full text-white border-white/30"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onLoginClick();
                      }}
                      variant="outline"
                      className="w-full text-white border-white/30"
                    >
                      Student Login
                    </Button>
                    <Button
                      type="button"
                      onClick={scrollToCounseling}
                      className="w-full bg-gold hover:bg-gold-dark text-white font-semibold"
                      data-ocid="nav.primary_button"
                    >
                      Enroll Now
                    </Button>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  onLoginClick?: () => void;
  onAdminClick?: () => void;
}
function HeroSection({ onLoginClick, onAdminClick }: HeroSectionProps) {
  const scrollToCounseling = () => {
    document
      .getElementById("counseling")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section
      id="home"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.07 252) 0%, oklch(0.22 0.07 252) 50%, oklch(0.26 0.06 240) 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 40px, oklch(0.72 0.12 78) 40px, oklch(0.72 0.12 78) 42px)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.12 78), transparent 70%)",
        }}
      />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-gold" />
            <span
              className="text-xs font-medium tracking-wider uppercase"
              style={HEADING_GRADIENT}
            >
              Tamil Nadu&apos;s Premier IAS Coaching
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
            style={HEADING_GRADIENT}
          >
            Welcome to Aatchiyalan IAS Academy
          </h1>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto">
            Your Gateway to Government Services — Expert Coaching for{" "}
            <strong className="text-white/90">
              TNPSC Group 1, Group 2/2A, Group 4, VAO
            </strong>{" "}
            &amp;{" "}
            <strong className="text-white/90">Madras High Court Exams</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              size="lg"
              onClick={scrollToCounseling}
              className="bg-gold hover:bg-gold-dark text-white font-bold text-base px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all"
              data-ocid="hero.primary_button"
            >
              Enroll Now <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={scrollToCounseling}
              className="border-white text-white hover:bg-white hover:text-navy font-bold text-base px-8 py-3 h-auto transition-all"
              data-ocid="hero.secondary_button"
            >
              Free Counseling
            </Button>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-16 bg-white/20" />
              <span className="text-white/50 text-xs uppercase tracking-widest font-medium">
                Portal Access
              </span>
              <div className="h-px w-16 bg-white/20" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm px-6 py-2.5 h-auto rounded-full backdrop-blur-sm transition-all hover:border-gold/60"
                data-ocid="hero.student_login.button"
              >
                <GraduationCap className="w-4 h-4 text-gold" />
                Student Login
              </Button>
              <Button
                type="button"
                onClick={onAdminClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm px-6 py-2.5 h-auto rounded-full backdrop-blur-sm transition-all hover:border-gold/60"
                data-ocid="hero.admin_login.button"
              >
                <Shield className="w-4 h-4 text-gold" />
                Admin Login
              </Button>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "500+", label: "Selections" },
              { value: "10+", label: "Years Experience" },
              { value: "5000+", label: "Students Trained" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-gold text-2xl font-extrabold">
                  {stat.value}
                </div>
                <div className="text-white/60 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── UPCOMING BATCHES ──────────────────────────────────────────────────────────
const batches = [
  { group: "Group 1", date: "April 5, 2026" },
  { group: "Group 2/2A", date: "April 10, 2026" },
  { group: "Group 4", date: "April 15, 2026" },
  { group: "VAO", date: "April 20, 2026" },
  { group: "Madras High Court", date: "May 1, 2026" },
  { group: "Test Batch", date: "Ongoing" },
  { group: "Maths Class", date: "May 5, 2026" },
];

function UpcomingBatches() {
  const scrollToCounseling = () => {
    document
      .getElementById("counseling")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section
      id="coaching"
      className="py-16"
      style={{ background: BRIGHT_BLUE }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2" style={HEADING_GRADIENT}>
            Upcoming Batches
          </h2>
          <p className="text-white/70">
            Enroll now to secure your seat in the next batch
          </p>
          <div className="w-16 h-1 bg-gold mx-auto mt-4 rounded-full" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-center gap-3 bg-navy text-white rounded-xl px-6 py-4 mb-8 max-w-2xl mx-auto shadow-md"
        >
          <Clock className="w-5 h-5 text-gold shrink-0" />
          <span className="font-semibold text-sm md:text-base">
            Batch Timings:{" "}
            <span className="text-gold">Morning 9:30 AM – 1:00 PM</span>
            <span className="text-white/60 mx-2">|</span>
            <span className="text-gold">Afternoon 2:00 PM – 4:30 PM</span>
          </span>
        </motion.div>
        <div
          className="flex flex-wrap justify-center gap-4"
          data-ocid="batches.list"
        >
          {batches.map((batch, i) => (
            <motion.div
              key={batch.group}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white border-2 border-navy rounded-xl px-6 py-4 shadow-card hover:shadow-lg transition-shadow text-center min-w-[160px]"
              data-ocid={`batches.item.${i + 1}`}
            >
              <div className="text-navy font-bold text-base mb-1">
                {batch.group}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
                <CheckCircle2 className="w-3 h-3 text-gold" />
                <span>Starts {batch.date}</span>
              </div>
              <button
                type="button"
                onClick={scrollToCounseling}
                className="mt-3 text-xs text-gold font-semibold hover:underline"
              >
                Register →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── COURSES ────────────────────────────────────────────────────────────────────
const courses = [
  {
    icon: <Award className="w-8 h-8" />,
    title: "TNPSC Group 1",
    subtitle: "Prelims + Mains + Interview",
    desc: "Comprehensive preparation for TNPSC Group 1 covering all subjects with expert faculty guidance and full study material.",
    durations: "6 Month / 1 Year",
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "TNPSC Group 2/2A",
    subtitle: "Interview & Non-Interview Posts",
    desc: "Structured coaching for Group 2 (Interview) and Group 2A (Non-Interview) posts with regular mock tests.",
    durations: "6 Month / 1 Year",
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "TNPSC Group 4 & VAO",
    subtitle: "Village Administrative Officer",
    desc: "Specialized coaching for Group 4 and VAO exams with complete syllabus coverage in Tamil & English medium.",
    durations: "6 Month / 1 Year",
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Madras High Court",
    subtitle: "Judicial Services Exam",
    desc: "Expert coaching for Madras High Court examinations covering all judicial service posts and support staff positions.",
    durations: "3 Month / 6 Month",
  },
  {
    icon: <ClipboardList className="w-8 h-8" />,
    title: "Test Batch",
    subtitle: "Online Quiz-Based Practice",
    desc: "Practice with real exam-pattern MCQ quizzes. First 2 tests free. Pay Rs.50 per test from the 3rd onwards.",
    durations: "Flexible",
  },
  {
    icon: <Calculator className="w-8 h-8" />,
    title: "Maths Class Batch",
    subtitle: "Mathematics Coaching",
    desc: "Specialized 1-month maths coaching with access to admin-assigned video lessons. No material downloads.",
    durations: "1 Month",
  },
];

function CoursesSection() {
  const scrollToCounseling = () => {
    document
      .getElementById("counseling")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section id="courses" className="py-16" style={{ background: BRIGHT_BLUE }}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2" style={HEADING_GRADIENT}>
            Our Leading Courses
          </h2>
          <p className="text-white/70">
            Expertly designed programs for every competitive exam
          </p>
          <div className="w-16 h-1 bg-gold mx-auto mt-4 rounded-full" />
        </motion.div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="courses.list"
        >
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border group"
              data-ocid={`courses.item.${i + 1}`}
            >
              <div className="w-14 h-14 bg-navy/10 rounded-xl flex items-center justify-center text-navy mb-4 group-hover:bg-navy group-hover:text-gold transition-all duration-300">
                {course.icon}
              </div>
              <h3 className="text-navy font-bold text-lg mb-1">
                {course.title}
              </h3>
              <p className="text-gold text-xs font-semibold mb-3">
                {course.subtitle}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {course.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-navy/10 text-navy px-3 py-1 rounded-full font-medium">
                  {course.durations}
                </span>
                <button
                  type="button"
                  onClick={scrollToCounseling}
                  className="text-gold text-sm font-semibold hover:underline flex items-center gap-1"
                >
                  Enroll <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── WHY CHOOSE US ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Award className="w-6 h-6" />,
    title: "Expert Faculty",
    desc: "10+ years of experience in TNPSC coaching with proven results and deep subject expertise.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Comprehensive Study Materials",
    desc: "Specially curated, regularly updated study materials aligned with the latest TNPSC syllabus.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Regular Mock Tests & Evaluations",
    desc: "Weekly mock tests with detailed performance analysis to track your preparation progress.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Small Batch Sizes",
    desc: "Limited seats per batch ensure personalized attention and focused learning for every student.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Proven Track Record",
    desc: "500+ selections across TNPSC exams. Our students consistently top the merit lists.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Tamil & English Medium",
    desc: "Classes conducted in both Tamil and English to ensure maximum comprehension and comfort.",
  },
];

function WhyChooseUs() {
  return (
    <section id="about" className="py-16" style={{ background: BRIGHT_BLUE }}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2" style={HEADING_GRADIENT}>
            Why Aatchiyalan IAS Academy?
          </h2>
          <p className="text-white/70">What sets us apart from the rest</p>
          <div className="w-16 h-1 bg-gold mx-auto mt-4 rounded-full" />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-xl p-6 shadow-card border border-border flex gap-4"
            >
              <div className="w-12 h-12 bg-gold/15 rounded-lg flex items-center justify-center text-gold shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-navy font-bold text-base mb-1">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SUCCESS STORIES ───────────────────────────────────────────────────────────
const tnpscAchievers = [
  { name: "R. MuthamilSelvan", post: "Group IV", year: "2025" },
  { name: "Vishnu Priya", post: "Rural Development Department", year: "2023" },
  { name: "Mani", post: "TNUSRB", year: "2023" },
];
const mhcAchievers = [
  { name: "Nithiya", post: "Senior Bailiff", year: "2025" },
  { name: "Malajothi", post: "Junior Bailiff", year: "2025" },
  { name: "Thirupathi", post: "Junior Bailiff", year: "2025" },
  { name: "Nagajothi", post: "Junior Bailiff", year: "2025" },
  { name: "Chandrabose", post: "Xerox Operator", year: "2025" },
];

function SuccessStories() {
  return (
    <section id="gallery" className="py-16" style={{ background: BRIGHT_BLUE }}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2" style={HEADING_GRADIENT}>
            Our Achievers
          </h2>
          <p className="text-white/70">
            Proud students who cleared government exams with Aatchiyalan IAS
            Academy
          </p>
          <div className="w-16 h-1 bg-gold mx-auto mt-4 rounded-full" />
        </motion.div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          data-ocid="testimonials.list"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border-2 border-navy shadow-lg overflow-hidden"
            data-ocid="testimonials.item.1"
          >
            <div className="bg-navy px-6 py-4 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-gold" />
              <h3 className="text-white font-bold text-lg tracking-wide">
                TNPSC Achievers
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {tnpscAchievers.map((a, i) => (
                <div
                  key={a.name}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  data-ocid={`testimonials.item.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-navy font-bold text-sm shrink-0">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{a.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {a.post}{" "}
                      <span className="text-gold font-semibold">
                        · {a.year}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto mt-0.5 shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-navy shadow-lg overflow-hidden"
            data-ocid="testimonials.item.2"
          >
            <div className="bg-navy px-6 py-4 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-gold" />
              <h3 className="text-white font-bold text-lg tracking-wide">
                Madras High Court Achievers 2025
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {mhcAchievers.map((a, i) => (
                <div
                  key={a.name}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  data-ocid={`testimonials.item.${i + 3}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-navy font-bold text-sm shrink-0">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{a.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {a.post}{" "}
                      <span className="text-gold font-semibold">
                        · {a.year}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto mt-0.5 shrink-0" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── COUNSELING FORM ───────────────────────────────────────────────────────────
function CounselingForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const { mutate, isPending } = useSubmitCounselingRequest();

  const openWhatsApp = (data: {
    name: string;
    email: string;
    phone: string;
    course: string;
  }) => {
    const message = `New Counseling Request from Aatchiyalan IAS Academy website:\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCourse Interested: ${data.course}`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !course) {
      toast.error("Please fill in all fields.");
      return;
    }
    mutate(
      { name, email, phone, courseInterest: course },
      {
        onSuccess: () => {
          toast.success(
            "Request submitted! Opening WhatsApp to notify us directly.",
          );
          openWhatsApp({ name, email, phone, course });
          setName("");
          setEmail("");
          setPhone("");
          setCourse("");
        },
        onError: () => toast.error("Something went wrong. Please try again."),
      },
    );
  };

  return (
    <section
      id="counseling"
      className="py-16"
      style={{ background: BRIGHT_BLUE }}
    >
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={HEADING_GRADIENT}>
              Request a Free Counseling Session
            </h2>
            <p className="text-white/70">
              Let our experts guide you to choose the right course for your
              goals
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-xl"
            data-ocid="counseling.modal"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <Label
                  htmlFor="c-name"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  Full Name *
                </Label>
                <Input
                  id="c-name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border"
                  data-ocid="counseling.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="c-email"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  Email Address *
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border"
                  data-ocid="counseling.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="c-phone"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  Mobile Number *
                </Label>
                <Input
                  id="c-phone"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-border"
                  data-ocid="counseling.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="c-course"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  Course Interested In *
                </Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger
                    className="border-border"
                    data-ocid="counseling.select"
                  >
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Group 1">TNPSC Group 1</SelectItem>
                    <SelectItem value="Group 2/2A">TNPSC Group 2/2A</SelectItem>
                    <SelectItem value="Group 4">TNPSC Group 4</SelectItem>
                    <SelectItem value="VAO">VAO</SelectItem>
                    <SelectItem value="Madras High Court">
                      Madras High Court
                    </SelectItem>
                    <SelectItem value="Test Batch">Test Batch</SelectItem>
                    <SelectItem value="Maths Class Batch">
                      Maths Class Batch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-navy hover:bg-navy-dark text-white font-bold text-base py-3 h-auto"
              data-ocid="counseling.submit_button"
            >
              {isPending ? "Submitting..." : "Request Free Counseling Session"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              After submitting, WhatsApp will open with your details pre-filled
              to notify us instantly.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  return (
    <footer id="contact" className="bg-navy-dark text-white/80">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-white">
              <img
                src={LOGO}
                alt="Aatchiyalan IAS Academy Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="font-bold text-sm" style={HEADING_GRADIENT}>
              {DIRECTOR}
            </div>
            <div className="text-xs font-semibold" style={HEADING_GRADIENT}>
              Director
            </div>
            <div className="text-xs font-medium" style={HEADING_GRADIENT}>
              {DIRECTOR_QUALS}
            </div>
          </div>
          <p
            className="text-sm leading-relaxed font-medium mb-5"
            style={HEADING_GRADIENT}
          >
            Tamil Nadu&apos;s premier coaching institution for TNPSC and
            government exams. Dedicated to transforming aspirants into
            government officers.
          </p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <h4
            className="font-bold text-base mb-5 uppercase tracking-wider"
            style={HEADING_GRADIENT}
          >
            Contact Us
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              <span style={CONTACT_GRADIENT} className="font-semibold">
                New Market Street, Near Bus Stand, Ariyalur - 621704
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a
                href="tel:+919894993796"
                style={CONTACT_GRADIENT}
                className="font-semibold hover:opacity-80 transition-opacity"
              >
                +91 98949 93796
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <a
                href="mailto:aatchiyalaniasacademy3.0@gmail.com"
                style={CONTACT_GRADIENT}
                className="font-semibold hover:opacity-80 transition-opacity"
              >
                aatchiyalaniasacademy3.0@gmail.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4
            className="font-bold text-base mb-5 uppercase tracking-wider"
            style={HEADING_GRADIENT}
          >
            Quick Links
          </h4>
          <ul className="space-y-2">
            {[
              { label: "About Us", href: "#about" },
              { label: "TNPSC Courses", href: "#courses" },
              { label: "Upcoming Batches", href: "#coaching" },
              { label: "Success Stories", href: "#gallery" },
              { label: "Free Counseling", href: "#counseling" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium transition-colors flex items-center gap-1.5"
                  style={HEADING_GRADIENT}
                  data-ocid="footer.link"
                >
                  <ChevronRight className="w-3 h-3" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>
            <span style={HEADING_GRADIENT}>
              &copy; {year} Aatchiyalan IAS Academy. All Rights Reserved.
            </span>
          </span>
          <div className="flex gap-4">
            <span className="hover:text-white/70 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-white/70 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors"
            >
              Built with ❤️ caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(
    null,
  );
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("student_auth");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrentStudent(data as StudentAccount);
      } catch {}
    }
    const adminSaved = localStorage.getItem("admin_auth");
    if (adminSaved === "true") setIsAdmin(true);
  }, []);

  const handleStudentSuccess = (student: StudentAccount) => {
    setCurrentStudent(student);
    setCurrentView("dashboard");
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem("admin_auth", "true");
    setCurrentView("admin");
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setIsAdmin(false);
    localStorage.removeItem("student_auth");
    localStorage.removeItem("admin_auth");
    setCurrentView("home");
  };

  if (currentView === "login") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage
          onStudentSuccess={handleStudentSuccess}
          onAdminSuccess={handleAdminSuccess}
          onBack={() => setCurrentView("home")}
        />
      </>
    );
  }

  if (currentView === "dashboard" && currentStudent) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <StudentDashboard student={currentStudent} onLogout={handleLogout} />
      </>
    );
  }

  if (currentView === "admin") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <AdminPanel onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      <UtilityBar />
      <Navigation
        currentStudent={currentStudent}
        isAdmin={isAdmin}
        onLoginClick={() => setCurrentView("login")}
        onDashboardClick={() => setCurrentView("dashboard")}
        onAdminClick={() => setCurrentView("admin")}
        onLogout={handleLogout}
      />
      <main>
        <HeroSection
          onLoginClick={() => setCurrentView("login")}
          onAdminClick={() => setCurrentView("admin")}
        />
        <UpcomingBatches />
        <CoursesSection />
        <WhyChooseUs />
        <SuccessStories />
        <CounselingForm />
      </main>
      <Footer />
    </div>
  );
}
