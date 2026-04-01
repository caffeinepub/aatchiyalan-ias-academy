import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Check,
  ClipboardList,
  CreditCard,
  FileText,
  LogOut,
  MessageSquare,
  Plus,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type {
  CounselingRequest,
  MaterialPublic,
  PaymentRequest,
  QuizPublic,
  QuizQuestion,
  StudentAccount,
  Subject,
  VideoPublic,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

const DARK_BLUE_BG = "#0a1628";
const LOGO =
  "/assets/uploads/picsart_26-03-28_15-51-14-131-019d33f8-4bce-7532-85c1-75a35238e473-1.png";
const HEADING_GRADIENT: React.CSSProperties = {
  background: "linear-gradient(90deg, #1565C0 0%, #e53935 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const COURSE_OPTIONS = [
  { value: "group1", label: "TNPSC Group 1" },
  { value: "group2", label: "TNPSC Group 2/2A" },
  { value: "group4", label: "TNPSC Group 4" },
  { value: "vao", label: "VAO" },
  { value: "mhc", label: "Madras High Court" },
  { value: "testbatch", label: "Test Batch" },
  { value: "mathsbatch", label: "Maths Class Batch" },
];

const DURATION_OPTIONS = [
  { value: "1month", label: "1 Month" },
  { value: "3month", label: "3 Months" },
  { value: "6month", label: "6 Months" },
  { value: "1year", label: "1 Year" },
];

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { actor: actorMaybe } = useActor();
  const actor = actorMaybe!;

  // Students
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [newStudent, setNewStudent] = useState({
    username: "",
    password: "",
    courseType: "",
    duration: "",
  });
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Subjects
  const [subjectCourse, setSubjectCourse] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Materials
  const [materialSubjectId, setMaterialSubjectId] = useState<bigint | null>(
    null,
  );
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<MaterialPublic[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
  });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const materialFileRef = useRef<HTMLInputElement>(null);

  // Videos
  const [videoSubjectId, setVideoSubjectId] = useState<bigint | null>(null);
  const [videos, setVideos] = useState<VideoPublic[]>([]);
  const [newVideo, setNewVideo] = useState({
    title: "",
    videoUrl: "",
    freeCourseTypes: [] as string[],
  });

  // Quizzes
  const [quizzes, setQuizzes] = useState<QuizPublic[]>([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    questions: [] as QuizQuestion[],
  });
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
  });

  // Payments
  const [payments, setPayments] = useState<PaymentRequest[]>([]);

  // Counseling
  const [counseling, setCounseling] = useState<CounselingRequest[]>([]);

  useEffect(() => {
    loadStudents();
    loadPayments();
    loadCounseling();
    loadAllSubjects();
    loadQuizzes();
  }, []);

  const loadStudents = async () => {
    try {
      setStudents(await actor.listAllStudents());
    } catch {}
  };
  const loadPayments = async () => {
    try {
      setPayments(await actor.listAllPayments());
    } catch {}
  };
  const loadCounseling = async () => {
    try {
      setCounseling(await actor.getAllCounselingRequests());
    } catch {}
  };
  const loadAllSubjects = async () => {
    const results: Subject[] = [];
    for (const c of COURSE_OPTIONS) {
      const s = await actor.listSubjects(c.value).catch(() => []);
      results.push(...s);
    }
    setAllSubjects(results);
  };
  const loadSubjectsForCourse = async (courseType: string) => {
    try {
      setSubjects(await actor.listSubjects(courseType));
    } catch {}
  };
  const loadMaterialsForSubject = async (subjectId: bigint) => {
    try {
      setMaterials(await actor.listMaterials(subjectId));
    } catch {}
  };
  const loadVideosForSubject = async (subjectId: bigint) => {
    try {
      setVideos(await actor.listVideos(subjectId));
    } catch {}
  };
  const loadQuizzes = async () => {
    try {
      setQuizzes(await actor.listQuizzes("testbatch"));
    } catch {}
  };

  // --- Students ---
  const handleCreateStudent = async () => {
    if (
      !newStudent.username ||
      !newStudent.password ||
      !newStudent.courseType ||
      !newStudent.duration
    ) {
      toast.error("Fill all fields");
      return;
    }
    setStudentsLoading(true);
    try {
      await actor.createStudent(
        newStudent.username,
        newStudent.password,
        newStudent.courseType,
        newStudent.duration,
      );
      toast.success("Student created!");
      setNewStudent({
        username: "",
        password: "",
        courseType: "",
        duration: "",
      });
      loadStudents();
    } catch {
      toast.error("Failed to create student");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleToggleStudent = async (s: StudentAccount) => {
    try {
      await actor.updateStudent(s.id, s.courseType, s.duration, !s.isActive);
      toast.success(`Student ${!s.isActive ? "activated" : "deactivated"}`);
      loadStudents();
    } catch {
      toast.error("Failed to update student");
    }
  };

  // --- Subjects ---
  const handleCreateSubject = async () => {
    if (!subjectCourse || !newSubjectName) {
      toast.error("Select course and enter subject name");
      return;
    }
    try {
      await actor.createSubject(subjectCourse, newSubjectName);
      setNewSubjectName("");
      loadSubjectsForCourse(subjectCourse);
      loadAllSubjects();
      toast.success("Subject created!");
    } catch {
      toast.error("Failed to create subject");
    }
  };

  const handleDeleteSubject = async (id: bigint) => {
    try {
      await actor.deleteSubject(id);
      loadSubjectsForCourse(subjectCourse);
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  // --- Materials ---
  const handleCreateMaterial = async () => {
    if (!materialSubjectId || !newMaterial.title || !materialFile) {
      toast.error("Fill all fields and select a file");
      return;
    }
    try {
      const bytes = new Uint8Array(await materialFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.createMaterial(
        materialSubjectId,
        newMaterial.title,
        newMaterial.description,
        blob,
        false,
      );
      toast.success("Material uploaded!");
      setNewMaterial({ title: "", description: "" });
      setMaterialFile(null);
      if (materialFileRef.current) materialFileRef.current.value = "";
      loadMaterialsForSubject(materialSubjectId);
    } catch {
      toast.error("Failed to upload material");
    }
  };

  const handleDeleteMaterial = async (id: bigint) => {
    try {
      await actor.deleteMaterial(id);
      if (materialSubjectId) loadMaterialsForSubject(materialSubjectId);
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  // --- Videos ---
  const handleCreateVideo = async () => {
    if (!videoSubjectId || !newVideo.title || !newVideo.videoUrl) {
      toast.error("Fill all fields");
      return;
    }
    try {
      await actor.createVideo(
        videoSubjectId,
        newVideo.title,
        newVideo.videoUrl,
        newVideo.freeCourseTypes,
      );
      toast.success("Video added!");
      setNewVideo({ title: "", videoUrl: "", freeCourseTypes: [] });
      loadVideosForSubject(videoSubjectId);
    } catch {
      toast.error("Failed to add video");
    }
  };

  const handleDeleteVideo = async (id: bigint) => {
    try {
      await actor.deleteVideo(id);
      if (videoSubjectId) loadVideosForSubject(videoSubjectId);
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  const toggleFreeCourseType = (course: string) => {
    setNewVideo((prev) => ({
      ...prev,
      freeCourseTypes: prev.freeCourseTypes.includes(course)
        ? prev.freeCourseTypes.filter((c) => c !== course)
        : [...prev.freeCourseTypes, course],
    }));
  };

  // --- Quizzes ---
  const handleAddQuestion = () => {
    if (
      !newQuestion.question ||
      !newQuestion.optionA ||
      !newQuestion.optionB ||
      !newQuestion.optionC ||
      !newQuestion.optionD
    ) {
      toast.error("Fill all question fields");
      return;
    }
    setNewQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion }],
    }));
    setNewQuestion({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
    });
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.title || newQuiz.questions.length === 0) {
      toast.error("Add title and at least one question");
      return;
    }
    try {
      await actor.createQuiz(newQuiz.title, "testbatch", newQuiz.questions);
      toast.success("Quiz created!");
      setNewQuiz({ title: "", questions: [] });
      loadQuizzes();
    } catch {
      toast.error("Failed to create quiz");
    }
  };

  const handleDeleteQuiz = async (id: bigint) => {
    try {
      await actor.deleteQuiz(id);
      loadQuizzes();
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  // --- Payments ---
  const handleApprovePayment = async (id: bigint) => {
    try {
      await actor.approvePayment(id);
      loadPayments();
      toast.success("Payment approved!");
    } catch {
      toast.error("Failed");
    }
  };
  const handleRejectPayment = async (id: bigint) => {
    try {
      await actor.rejectPayment(id);
      loadPayments();
      toast.success("Payment rejected");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50" style={{ background: DARK_BLUE_BG }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Logo" className="h-12 w-auto object-contain" />
            <span className="text-white font-bold">Admin Panel</span>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="students">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
            <TabsTrigger value="students" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-1">
              <ClipboardList className="w-4 h-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="counseling" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Counseling
            </TabsTrigger>
          </TabsList>

          {/* STUDENTS */}
          <TabsContent value="students">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>
                  Create New Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-semibold mb-1 block">
                      Username
                    </Label>
                    <Input
                      placeholder="username"
                      value={newStudent.username}
                      onChange={(e) =>
                        setNewStudent((p) => ({
                          ...p,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1 block">
                      Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="password"
                      value={newStudent.password}
                      onChange={(e) =>
                        setNewStudent((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1 block">
                      Course
                    </Label>
                    <Select
                      value={newStudent.courseType}
                      onValueChange={(v) =>
                        setNewStudent((p) => ({ ...p, courseType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1 block">
                      Duration
                    </Label>
                    <Select
                      value={newStudent.duration}
                      onValueChange={(v) =>
                        setNewStudent((p) => ({ ...p, duration: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleCreateStudent}
                  disabled={studentsLoading}
                  className="bg-blue-800 hover:bg-blue-900 text-white gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Student
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>All Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={Number(s.id)}>
                        <TableCell className="font-medium">
                          {s.username}
                        </TableCell>
                        <TableCell>
                          {COURSE_OPTIONS.find((c) => c.value === s.courseType)
                            ?.label || s.courseType}
                        </TableCell>
                        <TableCell>
                          {DURATION_OPTIONS.find((d) => d.value === s.duration)
                            ?.label || s.duration}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              s.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStudent(s)}
                          >
                            {s.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBJECTS */}
          <TabsContent value="subjects">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>Manage Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4 flex-wrap">
                  <Select
                    value={subjectCourse}
                    onValueChange={(v) => {
                      setSubjectCourse(v);
                      loadSubjectsForCourse(v);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {subjectCourse && (
                  <div className="space-y-2 mb-4">
                    {subjects.map((s) => (
                      <div
                        key={Number(s.id)}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                      >
                        <span className="font-medium">{s.subjectName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubject(s.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="New subject name"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCreateSubject}
                        className="bg-blue-800 hover:bg-blue-900 text-white gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MATERIALS */}
          <TabsContent value="materials">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>Upload Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Select
                    onValueChange={(v) => {
                      setMaterialSubjectId(BigInt(v));
                      loadMaterialsForSubject(BigInt(v));
                    }}
                  >
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubjects.map((s) => (
                        <SelectItem key={Number(s.id)} value={String(s.id)}>
                          {
                            COURSE_OPTIONS.find((c) => c.value === s.courseType)
                              ?.label
                          }{" "}
                          — {s.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {materialSubjectId !== null && (
                  <div>
                    <div className="space-y-2 mb-4">
                      {materials.map((m) => (
                        <div
                          key={Number(m.id)}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                        >
                          <div>
                            <span className="font-medium">{m.title}</span>
                            {m.description && (
                              <span className="text-sm text-muted-foreground ml-2">
                                — {m.description}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">
                          Title
                        </Label>
                        <Input
                          placeholder="Material title"
                          value={newMaterial.title}
                          onChange={(e) =>
                            setNewMaterial((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">
                          Description
                        </Label>
                        <Input
                          placeholder="Optional description"
                          value={newMaterial.description}
                          onChange={(e) =>
                            setNewMaterial((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-sm font-semibold mb-1 block">
                          File (PDF, DOC, etc.)
                        </Label>
                        <input
                          ref={materialFileRef}
                          type="file"
                          onChange={(e) =>
                            setMaterialFile(e.target.files?.[0] || null)
                          }
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateMaterial}
                      className="mt-4 bg-blue-800 hover:bg-blue-900 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" /> Upload Material
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* VIDEOS */}
          <TabsContent value="videos">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>Manage Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Select
                    onValueChange={(v) => {
                      setVideoSubjectId(BigInt(v));
                      loadVideosForSubject(BigInt(v));
                    }}
                  >
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubjects.map((s) => (
                        <SelectItem key={Number(s.id)} value={String(s.id)}>
                          {
                            COURSE_OPTIONS.find((c) => c.value === s.courseType)
                              ?.label
                          }{" "}
                          — {s.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {videoSubjectId !== null && (
                  <div>
                    <div className="space-y-2 mb-4">
                      {videos.map((v) => (
                        <div
                          key={Number(v.id)}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                        >
                          <div>
                            <span className="font-medium">{v.title}</span>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {v.freeCourseTypes.map((ct) => (
                                <Badge
                                  key={ct}
                                  className="text-xs bg-green-100 text-green-800"
                                >
                                  {ct}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(v.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">
                          Title
                        </Label>
                        <Input
                          placeholder="Video title"
                          value={newVideo.title}
                          onChange={(e) =>
                            setNewVideo((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-1 block">
                          Video URL (YouTube/Drive)
                        </Label>
                        <Input
                          placeholder="https://youtube.com/..."
                          value={newVideo.videoUrl}
                          onChange={(e) =>
                            setNewVideo((p) => ({
                              ...p,
                              videoUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-sm font-semibold mb-2 block">
                          Free access for batches:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {COURSE_OPTIONS.map((c) => (
                            <label
                              key={c.value}
                              className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded px-3 py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={newVideo.freeCourseTypes.includes(
                                  c.value,
                                )}
                                onChange={() => toggleFreeCourseType(c.value)}
                                className="accent-blue-800"
                              />
                              <span className="text-sm">{c.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateVideo}
                      className="mt-4 bg-blue-800 hover:bg-blue-900 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUIZZES */}
          <TabsContent value="quizzes">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>
                  Manage Quizzes (Test Batch)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  {quizzes.map((q) => (
                    <div
                      key={Number(q.id)}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <span className="font-medium">{q.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {q.questions.length} questions
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold mb-2 block">
                    Quiz Title
                  </Label>
                  <Input
                    placeholder="Quiz title"
                    value={newQuiz.title}
                    onChange={(e) =>
                      setNewQuiz((p) => ({ ...p, title: e.target.value }))
                    }
                    className="mb-4"
                  />

                  <h4 className="font-semibold mb-3">
                    Questions Added ({newQuiz.questions.length})
                  </h4>
                  {newQuiz.questions.map((q, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: quiz questions are ordered
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 mb-2 text-sm"
                    >
                      <strong>
                        {i + 1}. {q.question}
                      </strong>{" "}
                      — Correct:{" "}
                      <Badge className="bg-green-100 text-green-800">
                        {q.correctOption}
                      </Badge>
                    </div>
                  ))}

                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <h5 className="font-semibold mb-3">Add Question</h5>
                    <div className="space-y-2">
                      <Input
                        placeholder="Question text"
                        value={newQuestion.question}
                        onChange={(e) =>
                          setNewQuestion((p) => ({
                            ...p,
                            question: e.target.value,
                          }))
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Option A"
                          value={newQuestion.optionA}
                          onChange={(e) =>
                            setNewQuestion((p) => ({
                              ...p,
                              optionA: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Option B"
                          value={newQuestion.optionB}
                          onChange={(e) =>
                            setNewQuestion((p) => ({
                              ...p,
                              optionB: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Option C"
                          value={newQuestion.optionC}
                          onChange={(e) =>
                            setNewQuestion((p) => ({
                              ...p,
                              optionC: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Option D"
                          value={newQuestion.optionD}
                          onChange={(e) =>
                            setNewQuestion((p) => ({
                              ...p,
                              optionD: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-semibold">
                          Correct Answer:
                        </Label>
                        {["A", "B", "C", "D"].map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="correctOption"
                              value={opt}
                              checked={newQuestion.correctOption === opt}
                              onChange={() =>
                                setNewQuestion((p) => ({
                                  ...p,
                                  correctOption: opt,
                                }))
                              }
                              className="accent-blue-800"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddQuestion}
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Question
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateQuiz}
                    disabled={newQuiz.questions.length === 0}
                    className="mt-4 bg-blue-800 hover:bg-blue-900 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>Payment Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>UPI Ref</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={Number(p.id)}>
                        <TableCell>{p.username}</TableCell>
                        <TableCell>
                          {p.itemType} #{Number(p.itemId)}
                        </TableCell>
                        <TableCell>Rs.{Number(p.amount)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {p.upiRef}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              p.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : p.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayment(p.id)}
                                className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectPayment(p.id)}
                                className="text-red-600 border-red-300 gap-1"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No payment requests yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COUNSELING */}
          <TabsContent value="counseling">
            <Card>
              <CardHeader>
                <CardTitle style={HEADING_GRADIENT}>
                  Counseling Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {counseling.map((c) => (
                      <TableRow key={Number(c.id)}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>{c.courseInterest}</TableCell>
                      </TableRow>
                    ))}
                    {counseling.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No requests yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
