import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Prim "mo:prim";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

actor {
  // Authorization Mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Stable admin principal - persists across canister upgrades
  stable var stableAdminPrincipal : ?Principal = null;

  // Admin credentials for password-based login
  stable var adminUsername : Text = "admin";
  stable var adminPasswordHash : Text = "admin123";

  func isAdminCaller(caller : Principal) : Bool {
    switch (stableAdminPrincipal) {
      case (?p) { caller == p };
      case (null) { false };
    };
  };

  // Password-based admin login — returns true if credentials match
  public query func adminPasswordLogin(username : Text, password : Text) : async Bool {
    username == adminUsername and password == adminPasswordHash
  };

  // Change admin password (requires current password)
  public shared func setAdminPassword(currentPassword : Text, newUsername : Text, newPassword : Text) : async Bool {
    if (currentPassword == adminPasswordHash) {
      adminUsername := newUsername;
      adminPasswordHash := newPassword;
      true
    } else { false }
  };

  // Called from frontend after actor creation to register admin using secret token
  public shared ({ caller }) func _registerStableAdmin(userSecret : Text) : async Bool {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) { false };
      case (?adminToken) {
        if (userSecret == adminToken and userSecret != "") {
          stableAdminPrincipal := ?caller;
          true
        } else { false }
      };
    };
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Data structures
  public type CounselingRequest = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    courseInterest : Text;
  };

  module CounselingRequest {
    public func compare(a : CounselingRequest, b : CounselingRequest) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type ContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
  };

  module ContactMessage {
    public func compare(a : ContactMessage, b : ContactMessage) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Student Accounts
  public type StudentAccount = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    courseType : Text;
    duration : Text;
    isActive : Bool;
  };

  module StudentAccount {
    public func compare(a : StudentAccount, b : StudentAccount) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Subjects
  public type Subject = {
    id : Nat;
    courseType : Text;
    subjectName : Text;
  };

  module Subject {
    public func compare(a : Subject, b : Subject) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Materials
  public type Material = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    description : Text;
    blob : Storage.ExternalBlob;
    isPaid : Bool;
  };

  module Material {
    public func compare(a : Material, b : Material) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Material without blobId for unauthorized access
  public type MaterialPublic = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    description : Text;
    isPaid : Bool;
  };

  // Videos
  public type Video = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    videoUrl : Text;
    freeCourseTypes : [Text];
  };

  module Video {
    public func compare(a : Video, b : Video) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Video without videoUrl for unauthorized access
  public type VideoPublic = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    freeCourseTypes : [Text];
  };

  // Quiz Types
  public type QuizQuestion = {
    question : Text;
    optionA : Text;
    optionB : Text;
    optionC : Text;
    optionD : Text;
    correctOption : Text;
  };

  public type QuizQuestionPublic = {
    question : Text;
    optionA : Text;
    optionB : Text;
    optionC : Text;
    optionD : Text;
  };

  public type Quiz = {
    id : Nat;
    title : Text;
    courseType : Text;
    questions : [QuizQuestion];
  };

  public type QuizPublic = {
    id : Nat;
    title : Text;
    courseType : Text;
    questions : [QuizQuestionPublic];
  };

  module Quiz {
    public func compare(a : Quiz, b : Quiz) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type QuizAttempt = {
    id : Nat;
    username : Text;
    quizId : Nat;
    score : Nat;
    totalQuestions : Nat;
    timestamp : Int;
  };

  module QuizAttempt {
    public func compare(a : QuizAttempt, b : QuizAttempt) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Payment Request Types
  public type PaymentRequest = {
    id : Nat;
    username : Text;
    itemType : Text;
    itemId : Nat;
    amount : Nat;
    status : Text;
    upiRef : Text;
  };

  module PaymentRequest {
    public func compare(a : PaymentRequest, b : PaymentRequest) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Storage
  let counselingRequests = Map.empty<Nat, CounselingRequest>();
  let contactMessages = Map.empty<Nat, ContactMessage>();
  let students = Map.empty<Nat, StudentAccount>();
  let subjects = Map.empty<Nat, Subject>();
  let materials = Map.empty<Nat, Material>();
  let videos = Map.empty<Nat, Video>();
  let quizzes = Map.empty<Nat, Quiz>();
  let quizAttempts = Map.empty<Nat, QuizAttempt>();
  let payments = Map.empty<Nat, PaymentRequest>();

  // Counters
  var counselingRequestCounter = 0;
  var contactMessageCounter = 0;
  var studentCounter = 0;
  var subjectCounter = 0;
  var materialCounter = 0;
  var videoCounter = 0;
  var quizCounter = 0;
  var quizAttemptCounter = 0;
  var paymentCounter = 0;

  // Public submissions - No authorization required (guests can submit)
  public shared ({ caller }) func submitCounselingRequest(name : Text, email : Text, phone : Text, courseInterest : Text) : async () {
    let newRequest : CounselingRequest = {
      id = counselingRequestCounter;
      name;
      email;
      phone;
      courseInterest;
    };
    counselingRequests.add(counselingRequestCounter, newRequest);
    counselingRequestCounter += 1;
  };

  public shared ({ caller }) func submitContactMessage(name : Text, email : Text, message : Text) : async () {
    let newMessage : ContactMessage = {
      id = contactMessageCounter;
      name;
      email;
      message;
    };
    contactMessages.add(contactMessageCounter, newMessage);
    contactMessageCounter += 1;
  };

  // Admin-only functionalities
  public query ({ caller }) func getAllCounselingRequests() : async [CounselingRequest] {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can view counseling requests");
    };
    counselingRequests.values().toArray().sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  public query ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    contactMessages.values().toArray().sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Student Account Management (Admin)
  public shared ({ caller }) func createStudent(username : Text, password : Text, courseType : Text, duration : Text) : async Nat {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can create student accounts");
    };
    let newStudent : StudentAccount = {
      id = studentCounter;
      username;
      passwordHash = password;
      courseType;
      duration;
      isActive = true;
    };
    students.add(studentCounter, newStudent);
    let id = studentCounter;
    studentCounter += 1;
    id;
  };

  public shared ({ caller }) func updateStudent(id : Nat, courseType : Text, duration : Text, isActive : Bool) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can update student accounts");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(id, {
          id;
          username = student.username;
          passwordHash = student.passwordHash;
          courseType;
          duration;
          isActive;
        });
      };
    };
  };

  public query ({ caller }) func getStudentByUsername(username : Text) : async ?StudentAccount {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can view student details");
    };
    var student : ?StudentAccount = null;
    students.values().forEach(func(s) { if (s.username == username) { student := ?s } });
    student;
  };

  public query ({ caller }) func listAllStudents() : async [StudentAccount] {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can list all students");
    };
    students.values().toArray().sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Student Login (Public) - Returns Bool for credential validation
  public query ({ caller }) func studentLogin(username : Text, password : Text) : async Bool {
    studentLoginInternal(username, password);
  };

  // Subject Management (Admin)
  public shared ({ caller }) func createSubject(courseType : Text, subjectName : Text) : async Nat {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can create subjects");
    };
    let newSubject : Subject = {
      id = subjectCounter;
      courseType;
      subjectName;
    };
    subjects.add(subjectCounter, newSubject);
    let id = subjectCounter;
    subjectCounter += 1;
    id;
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can delete subjects");
    };
    subjects.remove(id);
  };

  public query ({ caller }) func listSubjects(courseType : Text) : async [Subject] {
    subjects.values().toArray().filter(func(s) { s.courseType == courseType }).sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Material Management (Admin)
  public shared ({ caller }) func createMaterial(subjectId : Nat, title : Text, description : Text, blob : Storage.ExternalBlob, isPaid : Bool) : async Nat {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can create materials");
    };
    let newMaterial : Material = {
      id = materialCounter;
      subjectId;
      title;
      description;
      blob;
      isPaid;
    };
    materials.add(materialCounter, newMaterial);
    let id = materialCounter;
    materialCounter += 1;
    id;
  };

  public shared ({ caller }) func deleteMaterial(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can delete materials");
    };
    materials.remove(id);
  };

  // List materials without blobId for non-authorized users
  public query ({ caller }) func listMaterials(subjectId : Nat) : async [MaterialPublic] {
    materials.values().toArray().filter(func(m) { m.subjectId == subjectId }).map<Material, MaterialPublic>(
      func(m) {
        {
          id = m.id;
          subjectId = m.subjectId;
          title = m.title;
          description = m.description;
          isPaid = m.isPaid;
        };
      }
    ).sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Get material access with authorization check
  public query ({ caller }) func getMaterialAccess(username : Text, password : Text, materialId : Nat) : async ?Storage.ExternalBlob {
    // Verify student credentials
    if (not studentLoginInternal(username, password)) {
      return null;
    };

    switch (materials.get(materialId)) {
      case (null) { null };
      case (?material) {
        // Get student info
        let studentOpt = getStudentByUsernameInternal(username);
        switch (studentOpt) {
          case (null) { null };
          case (?student) {
            // Check if material is free or requires payment
            if (not material.isPaid) {
              // Free materials - check if student has 6month or 1year duration
              if (student.duration == "6month" or student.duration == "1year") {
                ?material.blob;
              } else {
                null;
              };
            } else {
              // Paid materials - check payment approval
              if (checkPaymentApprovedInternal(username, "material", materialId)) {
                ?material.blob;
              } else {
                null;
              };
            };
          };
        };
      };
    };
  };

  // Video Management (Admin)
  public shared ({ caller }) func createVideo(subjectId : Nat, title : Text, videoUrl : Text, freeCourseTypes : [Text]) : async Nat {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can create videos");
    };
    let newVideo : Video = {
      id = videoCounter;
      subjectId;
      title;
      videoUrl;
      freeCourseTypes;
    };
    videos.add(videoCounter, newVideo);
    let id = videoCounter;
    videoCounter += 1;
    id;
  };

  public shared ({ caller }) func updateVideoFreeBatches(videoId : Nat, freeCourseTypes : [Text]) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        videos.add(videoId, {
          id = videoId;
          subjectId = video.subjectId;
          title = video.title;
          videoUrl = video.videoUrl;
          freeCourseTypes;
        });
      };
    };
  };

  public shared ({ caller }) func deleteVideo(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    videos.remove(id);
  };

  // List videos without videoUrl for unauthorized users
  public query ({ caller }) func listVideos(subjectId : Nat) : async [VideoPublic] {
    videos.values().toArray().filter(func(v) { v.subjectId == subjectId }).map<Video, VideoPublic>(
      func(v) {
        {
          id = v.id;
          subjectId = v.subjectId;
          title = v.title;
          freeCourseTypes = v.freeCourseTypes;
        };
      }
    ).sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Get video access with authorization check
  public query ({ caller }) func getVideoAccess(username : Text, password : Text, videoId : Nat) : async ?Text {
    // Verify student credentials
    if (not studentLoginInternal(username, password)) {
      return null;
    };

    switch (videos.get(videoId)) {
      case (null) { null };
      case (?video) {
        // Get student info
        let studentOpt = getStudentByUsernameInternal(username);
        switch (studentOpt) {
          case (null) { null };
          case (?student) {
            // Check if student's courseType is in freeCourseTypes
            let isFree = video.freeCourseTypes.find<Text>(func(ct) { ct == student.courseType }) != null;

            if (isFree) {
              ?video.videoUrl;
            } else {
              // Check payment approval
              if (checkPaymentApprovedInternal(username, "video", videoId)) {
                ?video.videoUrl;
              } else {
                null;
              };
            };
          };
        };
      };
    };
  };

  // Quiz Management (Admin)
  public shared ({ caller }) func createQuiz(title : Text, courseType : Text, questions : [QuizQuestion]) : async Nat {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can create quizzes");
    };
    let newQuiz : Quiz = {
      id = quizCounter;
      title;
      courseType;
      questions;
    };
    quizzes.add(quizCounter, newQuiz);
    let id = quizCounter;
    quizCounter += 1;
    id;
  };

  public shared ({ caller }) func deleteQuiz(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can delete quizzes");
    };
    quizzes.remove(id);
  };

  // List quizzes without correctOption
  public query ({ caller }) func listQuizzes(courseType : Text) : async [QuizPublic] {
    quizzes.values().toArray().filter(func(q) { q.courseType == courseType }).map<Quiz, QuizPublic>(
      func(q) {
        {
          id = q.id;
          title = q.title;
          courseType = q.courseType;
          questions = q.questions.map(
            func(question) {
              {
                question = question.question;
                optionA = question.optionA;
                optionB = question.optionB;
                optionC = question.optionC;
                optionD = question.optionD;
              };
            },
          );
        };
      }
    ).sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Get student quiz attempt count
  public query ({ caller }) func getStudentQuizAttemptCount(username : Text, password : Text) : async Nat {
    // Verify student credentials
    if (not studentLoginInternal(username, password)) {
      Runtime.trap("Unauthorized: Invalid student credentials");
    };

    var count = 0;
    quizAttempts.values().forEach(
      func(attempt) {
        if (attempt.username == username) {
          count += 1;
        };
      }
    );
    count;
  };

  // Submit quiz attempt with authorization
  public shared ({ caller }) func submitQuizAttempt(username : Text, password : Text, quizId : Nat, answers : [Text]) : async ?QuizAttempt {
    // Verify student credentials
    if (not studentLoginInternal(username, password)) {
      return null;
    };

    // Get quiz
    let quizOpt = quizzes.get(quizId);
    switch (quizOpt) {
      case (null) { null };
      case (?quiz) {
        // Count existing attempts for this student
        var attemptCount = 0;
        quizAttempts.values().forEach(
          func(attempt) {
            if (attempt.username == username) {
              attemptCount += 1;
            };
          }
        );

        // First 2 attempts are free, then need payment approval
        if (attemptCount >= 2) {
          // Check if payment is approved for quiz access
          if (not checkPaymentApprovedInternal(username, "quiz", quizId)) {
            return null;
          };
        };

        // Calculate score
        var score = 0;
        let totalQuestions = quiz.questions.size();

        if (answers.size() == totalQuestions) {
          for (i in answers.keys()) {
            if (i < totalQuestions and answers[i] == quiz.questions[i].correctOption) {
              score += 1;
            };
          };
        };

        // Create quiz attempt
        let newAttempt : QuizAttempt = {
          id = quizAttemptCounter;
          username;
          quizId;
          score;
          totalQuestions;
          timestamp = Time.now();
        };
        quizAttempts.add(quizAttemptCounter, newAttempt);
        quizAttemptCounter += 1;
        ?newAttempt;
      };
    };
  };

  // Payment Requests
  public query ({ caller }) func checkPaymentApproved(username : Text, itemType : Text, itemId : Nat) : async Bool {
    checkPaymentApprovedInternal(username, itemType, itemId);
  };

  public shared ({ caller }) func createPaymentRequest(username : Text, password : Text, itemType : Text, itemId : Nat, amount : Nat, upiRef : Text) : async Nat {
    if (not studentLoginInternal(username, password)) {
      Runtime.trap("Unauthorized: Invalid student credentials");
    };
    let newPayment : PaymentRequest = {
      id = paymentCounter;
      username;
      itemType;
      itemId;
      amount;
      status = "pending";
      upiRef;
    };
    payments.add(paymentCounter, newPayment);
    let id = paymentCounter;
    paymentCounter += 1;
    id;
  };

  public shared ({ caller }) func approvePayment(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can approve payments");
    };
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        payments.add(id, {
          payment with status = "approved";
        });
      };
    };
  };

  public shared ({ caller }) func rejectPayment(id : Nat) : async () {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can reject payments");
    };
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        payments.add(id, {
          payment with status = "rejected";
        });
      };
    };
  };

  public query ({ caller }) func listAllPayments() : async [PaymentRequest] {
    if (not (isAdminCaller(caller))) {
      Runtime.trap("Unauthorized: Only admins can view payments");
    };
    payments.values().toArray().sort(func(a, b) { Nat.compare(a.id, b.id) });
  };

  // Internal Helper Functions
  func studentLoginInternal(username : Text, password : Text) : Bool {
    var isValid = false;
    students.values().forEach(
      func(student) {
        if (student.username == username and student.passwordHash == password and student.isActive) {
          isValid := true;
        };
      }
    );
    isValid;
  };

  func getStudentByUsernameInternal(username : Text) : ?StudentAccount {
    var student : ?StudentAccount = null;
    students.values().forEach(func(s) { if (s.username == username) { student := ?s } });
    student;
  };

  func checkPaymentApprovedInternal(username : Text, itemType : Text, itemId : Nat) : Bool {
    payments.values().toArray().filter(
      func(payment) {
        payment.username == username and payment.itemType == itemType and payment.itemId == itemId and payment.status == "approved"
      }
    ).isEmpty() == false;
  };
};
