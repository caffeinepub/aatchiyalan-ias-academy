import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization Mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
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
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  // Storage
  let counselingRequests = Map.empty<Nat, CounselingRequest>();
  let contactMessages = Map.empty<Nat, ContactMessage>();

  // Counters
  var counselingRequestCounter = 0;
  var contactMessageCounter = 0;

  // Public submissions - No authorization required (guests can submit)
  public shared ({ caller }) func submitCounselingRequest(name : Text, email : Text, phone : Text, courseInterest : Text) : async () {
    // No authorization check - public can submit without login
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
    // No authorization check - public can submit without login
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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view counseling requests");
    };
    counselingRequests.values().toArray().sort();
  };

  public query ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    contactMessages.values().toArray().sort();
  };
};
