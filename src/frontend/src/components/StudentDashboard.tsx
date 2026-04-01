import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  ChevronLeft,
  Download,
  FileText,
  Lock,
  LogOut,
  Play,
  Trophy,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  MaterialPublic,
  QuizAttempt,
  QuizPublic,
  QuizQuestionPublic,
  StudentAccount,
  Subject,
  VideoPublic,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import PaymentModal from "./PaymentModal";

const BRIGHT_BLUE = "oklch(0.55 0.22 258)";
const DARK_BLUE_BG = "#0a1628";
const LOGO =
  "/assets/uploads/picsart_26-03-28_15-51-14-131-019d33f8-4bce-7532-85c1-75a35238e473-1.png";
const HEADING_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565C0 0%, #e53935 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const COURSE_LABELS: Record<string, string> = {
  group1: "TNPSC Group 1",
  group2: "TNPSC Group 2/2A",
  group4: "TNPSC Group 4",
  vao: "VAO",
  mhc: "Madras High Court",
  testbatch: "Test Batch",
  mathsbatch: "Maths Class Batch",
};
const DURATION_LABELS: Record<string, string> = {
  "1month": "1 Month",
  "3month": "3 Months",
  "6month": "6 Months",
  "1year": "1 Year",
};

function canDownloadFree(duration: string) {
  return duration === "6month" || duration === "1year";
}

interface StudentDashboardProps {
  student: StudentAccount;
  onLogout: () => void;
}

export default function StudentDashboard({
  student,
  onLogout,
}: StudentDashboardProps) {
  const { actor: actorMaybe } = useActor();
  const actor = actorMaybe!;
  const savedAuth = JSON.parse(localStorage.getItem("student_auth") || "{}");
  const username = savedAuth.username || student.username;
  const password = savedAuth.password || "";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<MaterialPublic[]>([]);
  const [videos, setVideos] = useState<VideoPublic[]>([]);
  const [quizzes, setQuizzes] = useState<QuizPublic[]>([]);
  const [_quizAttemptCount, setQuizAttemptCount] = useState(0);
  const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
  const [payModal, setPayModal] = useState<{
    open: boolean;
    itemType: string;
    itemId: bigint;
    amount: number;
    name: string;
  } | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizPublic | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: actor is stable
  useEffect(() => {
    actor
      .listSubjects(student.courseType)
      .then(setSubjects)
      .catch(() => {});
    if (student.courseType === "testbatch") {
      actor
        .listQuizzes("testbatch")
        .then(setQuizzes)
        .catch(() => {});
      actor
        .getStudentQuizAttemptCount(username, password)
        .then((n) => setQuizAttemptCount(Number(n)))
        .catch(() => {});
    }
  }, [student.courseType]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: actor is stable
  useEffect(() => {
    if (!selectedSubject) return;
    actor
      .listMaterials(selectedSubject.id)
      .then(setMaterials)
      .catch(() => {});
    actor
      .listVideos(selectedSubject.id)
      .then(setVideos)
      .catch(() => {});
  }, [selectedSubject]);

  const checkApproved = async (itemType: string, itemId: bigint) => {
    try {
      const ok = await actor.checkPaymentApproved(username, itemType, itemId);
      if (ok) {
        setApprovedItems((prev) => new Set(prev).add(`${itemType}_${itemId}`));
      }
    } catch {}
  };

  const handleDownloadMaterial = async (material: MaterialPublic) => {
    try {
      const blob = await actor.getMaterialAccess(
        username,
        password,
        material.id,
      );
      if (blob) {
        const url = blob.getDirectURL();
        window.open(url, "_blank");
      } else {
        // Check if payment approved
        const ok = await actor.checkPaymentApproved(
          username,
          "material",
          material.id,
        );
        if (!ok) {
          toast.error("No access. Please pay to download.");
        } else {
          toast.error("Access check failed. Contact admin.");
        }
      }
    } catch {
      toast.error("Failed to access material.");
    }
  };

  const handleWatchVideo = async (video: VideoPublic) => {
    try {
      const url = await actor.getVideoAccess(username, password, video.id);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("No access to this video.");
      }
    } catch {
      toast.error("Failed to access video.");
    }
  };

  const handleTakeQuiz = (quiz: QuizPublic) => {
    setActiveQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(""));
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    if (quizAnswers.some((a) => !a)) {
      toast.error("Answer all questions first");
      return;
    }
    setQuizLoading(true);
    try {
      const result = await actor.submitQuizAttempt(
        username,
        password,
        activeQuiz.id,
        quizAnswers,
      );
      if (result) {
        setQuizResult(result);
        setQuizAttemptCount((prev) => prev + 1);
        toast.success(
          `Quiz submitted! Score: ${result.score}/${result.totalQuestions}`,
        );
      } else {
        toast.error("Cannot submit quiz. Payment required or login issue.");
      }
    } catch {
      toast.error("Failed to submit quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const isFreeVideo = (video: VideoPublic) =>
    video.freeCourseTypes.includes(student.courseType);

  const isItemApproved = (type: string, id: bigint) =>
    approvedItems.has(`${type}_${id}`);

  if (activeQuiz) {
    return (
      <div className="min-h-screen" style={{ background: BRIGHT_BLUE }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button
            type="button"
            onClick={() => {
              setActiveQuiz(null);
              setQuizResult(null);
            }}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Quizzes
          </button>
          <Card>
            <CardHeader>
              <CardTitle style={HEADING_GRADIENT}>{activeQuiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {quizResult ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {Number(quizResult.score)} /{" "}
                    {Number(quizResult.totalQuestions)}
                  </div>
                  <p className="text-muted-foreground">Quiz completed!</p>
                  <Button
                    onClick={() => {
                      setActiveQuiz(null);
                      setQuizResult(null);
                    }}
                    className="mt-6 bg-blue-800 hover:bg-blue-900 text-white"
                  >
                    Back to Quiz List
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeQuiz.questions.map(
                    (q: QuizQuestionPublic, qi: number) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: question order is stable
                      <div key={qi} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold mb-3">
                          {qi + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {(["A", "B", "C", "D"] as const).map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-blue-50"
                            >
                              <input
                                type="radio"
                                name={`q${qi}`}
                                value={opt}
                                checked={quizAnswers[qi] === opt}
                                onChange={() => {
                                  const a = [...quizAnswers];
                                  a[qi] = opt;
                                  setQuizAnswers(a);
                                }}
                                className="accent-blue-800"
                              />
                              <span>
                                <strong>{opt}.</strong>{" "}
                                {q[`option${opt}` as keyof QuizQuestionPublic]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={quizLoading}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold"
                  >
                    {quizLoading ? "Submitting..." : "Submit Quiz"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BRIGHT_BLUE }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: DARK_BLUE_BG }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Logo" className="h-12 w-auto object-contain" />
            <div>
              <div className="text-white font-bold text-sm">
                Welcome, {username}
              </div>
              <div className="text-white/60 text-xs">
                {COURSE_LABELS[student.courseType] || student.courseType} ·{" "}
                {DURATION_LABELS[student.duration] || student.duration}
              </div>
            </div>
          </div>
          <Button
            type="button"
            onClick={onLogout}
            variant="ghost"
            className="text-white/70 hover:text-white gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {student.courseType === "testbatch" ? (
          // Quiz-only view for Test Batch
          <div>
            <h2 className="text-2xl font-bold mb-6" style={HEADING_GRADIENT}>
              Test Batch — Quizzes
            </h2>
            <p className="text-white/80 mb-6">
              First 2 quizzes are free. From the 3rd quiz, pay Rs.50 per quiz.
            </p>
            <div className="grid gap-4">
              {quizzes.map((quiz, idx) => {
                const free = idx < 2;
                const approved = isItemApproved("quiz", quiz.id);
                return (
                  <Card key={Number(quiz.id)}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="font-bold text-navy">{quiz.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {quiz.questions.length} questions
                        </div>
                        {free && (
                          <Badge className="mt-1 bg-green-100 text-green-800">
                            Free
                          </Badge>
                        )}
                      </div>
                      {free || approved ? (
                        <Button
                          onClick={() => handleTakeQuiz(quiz)}
                          className="bg-blue-800 hover:bg-blue-900 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" /> Take Quiz
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <Button
                            onClick={() => {
                              checkApproved("quiz", quiz.id);
                              setPayModal({
                                open: true,
                                itemType: "quiz",
                                itemId: quiz.id,
                                amount: 50,
                                name: quiz.title,
                              });
                            }}
                            variant="outline"
                            className="text-blue-800 border-blue-800"
                          >
                            Pay Rs.50
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {quizzes.length === 0 && (
                <p className="text-white/70">No quizzes available yet.</p>
              )}
            </div>
          </div>
        ) : (
          // Subjects + Materials + Videos view
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar: subjects */}
            <div className="md:col-span-1">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Subjects
              </h3>
              <div className="space-y-2">
                {subjects.map((s) => (
                  <button
                    key={Number(s.id)}
                    type="button"
                    onClick={() => setSelectedSubject(s)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubject?.id === s.id
                        ? "bg-white text-blue-900 shadow-md"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {s.subjectName}
                  </button>
                ))}
                {subjects.length === 0 && (
                  <p className="text-white/60 text-sm">No subjects yet.</p>
                )}
              </div>
            </div>

            {/* Main: materials + videos */}
            <div className="md:col-span-3">
              {!selectedSubject ? (
                <div className="bg-white/10 rounded-2xl p-8 text-center text-white/60">
                  Select a subject from the left to view materials and videos.
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    {selectedSubject.subjectName}
                  </h2>
                  <Tabs defaultValue="materials">
                    <TabsList className="mb-4">
                      <TabsTrigger
                        value="materials"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Materials
                      </TabsTrigger>
                      <TabsTrigger
                        value="videos"
                        className="flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Videos
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials">
                      <div className="space-y-3">
                        {materials.map((m) => {
                          const free = canDownloadFree(student.duration);
                          const approved = isItemApproved("material", m.id);
                          return (
                            <Card key={Number(m.id)}>
                              <CardContent className="flex items-center justify-between p-4">
                                <div>
                                  <div className="font-semibold text-navy">
                                    {m.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {m.description}
                                  </div>
                                </div>
                                {free || approved ? (
                                  <Button
                                    onClick={() => handleDownloadMaterial(m)}
                                    className="bg-blue-800 hover:bg-blue-900 text-white gap-2"
                                  >
                                    <Download className="w-4 h-4" /> Download
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <Button
                                      onClick={() => {
                                        checkApproved("material", m.id);
                                        setPayModal({
                                          open: true,
                                          itemType: "material",
                                          itemId: m.id,
                                          amount: 150,
                                          name: m.title,
                                        });
                                      }}
                                      variant="outline"
                                      className="text-blue-800 border-blue-800"
                                    >
                                      Pay Rs.150
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                        {materials.length === 0 && (
                          <p className="text-white/70">
                            No materials available for this subject yet.
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="videos">
                      {student.courseType === "mathsbatch" ? (
                        <div>
                          <p className="text-white/80 mb-4 text-sm">
                            As a Maths Class Batch student, you can watch videos
                            assigned to your batch for free.
                          </p>
                          <div className="space-y-3">
                            {videos
                              .filter((v) =>
                                v.freeCourseTypes.includes("mathsbatch"),
                              )
                              .map((v) => (
                                <Card key={Number(v.id)}>
                                  <CardContent className="flex items-center justify-between p-4">
                                    <div className="font-semibold text-navy">
                                      {v.title}
                                    </div>
                                    <Button
                                      onClick={() => handleWatchVideo(v)}
                                      className="bg-blue-800 hover:bg-blue-900 text-white gap-2"
                                    >
                                      <Play className="w-4 h-4" /> Watch
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            {videos.filter((v) =>
                              v.freeCourseTypes.includes("mathsbatch"),
                            ).length === 0 && (
                              <p className="text-white/70">
                                No videos assigned to your batch yet.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {videos.map((v) => {
                            const free = isFreeVideo(v);
                            const approved = isItemApproved("video", v.id);
                            return (
                              <Card key={Number(v.id)}>
                                <CardContent className="flex items-center justify-between p-4">
                                  <div className="font-semibold text-navy">
                                    {v.title}
                                  </div>
                                  {free || approved ? (
                                    <Button
                                      onClick={() => handleWatchVideo(v)}
                                      className="bg-blue-800 hover:bg-blue-900 text-white gap-2"
                                    >
                                      <Play className="w-4 h-4" /> Watch
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Lock className="w-4 h-4 text-gray-400" />
                                      <Button
                                        onClick={() => {
                                          checkApproved("video", v.id);
                                          setPayModal({
                                            open: true,
                                            itemType: "video",
                                            itemId: v.id,
                                            amount: 200,
                                            name: v.title,
                                          });
                                        }}
                                        variant="outline"
                                        className="text-blue-800 border-blue-800"
                                      >
                                        Pay Rs.200
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                          {videos.length === 0 && (
                            <p className="text-white/70">
                              No videos available for this subject yet.
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {payModal && (
        <PaymentModal
          open={payModal.open}
          onClose={() => setPayModal(null)}
          username={username}
          password={password}
          itemType={payModal.itemType}
          itemId={payModal.itemId}
          amount={payModal.amount}
          itemName={payModal.name}
          onPaymentSubmitted={() =>
            checkApproved(payModal.itemType, payModal.itemId)
          }
        />
      )}
    </div>
  );
}
