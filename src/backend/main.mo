import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile implementation
  public type UserProfile = {
    name : Text;
    studentId : ?Text; // Optional: links user to their student record
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public type Subject = {
    #odia;
    #maths;
    #scienceAndSocial;
    #english;
    #drawing;
  };

  public type AssessmentType = {
    #fa1;
    #fa2;
    #sa1;
    #sa2;
    #writtenWork1;
    #writtenWork2;
    #projectWork1;
    #projectWork2;
  };

  public type MarkEntry = {
    studentId : Text;
    subject : Subject;
    assessmentType : AssessmentType;
    marks : Nat;
  };

  public type FinalSubjectResult = {
    subject : Subject;
    totalMarks : Nat;
  };

  public type FinalSessionResult = {
    studentId : Text;
    marksEntries : [MarkEntry];
    totalMarks : Nat;
  };

  // Constants for full marks
  let FA_FULL_MARKS = 25;
  let SA_FULL_MARKS = 50;
  let WRITTEN_WORK_FULL_MARKS = 10;
  let PROJECT_WORK_FULL_MARKS = 20;

  // Type for persistent marks using Map (studentId, subject, assessmentType) -> marks
  let persistentMarks = Map.empty<Text, Nat>();

  // Returns full marks for assessment type
  func getFullMarks(assessmentType : AssessmentType) : Nat {
    switch (assessmentType) {
      case (#fa1 or #fa2) { FA_FULL_MARKS };
      case (#sa1 or #sa2) { SA_FULL_MARKS };
      case (#writtenWork1 or #writtenWork2) { WRITTEN_WORK_FULL_MARKS };
      case (#projectWork1 or #projectWork2) { PROJECT_WORK_FULL_MARKS };
    };
  };

  func validateMarks(assessmentType : AssessmentType, marksSecured : Nat) {
    let fullMarks = getFullMarks(assessmentType);
    if (marksSecured > fullMarks) {
      Runtime.trap("Marks cannot exceed full marks");
    };
  };

  // Helper function to check if caller can access student data
  func canAccessStudentData(caller : Principal, studentId : Text) : Bool {
    // Admins can access all student data
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    // Check if caller's profile matches the studentId
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.studentId) {
          case (?id) { id == studentId };
          case (null) { false };
        };
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func submitMarks(studentId : Text, subject : Subject, assessmentType : AssessmentType, marks : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit marks");
    };
    validateMarks(assessmentType, marks);

    let key = studentId # "|" # debug_show (subject) # "|" # debug_show (assessmentType);
    persistentMarks.add(key, marks);
  };

  func subjectFromText(text : Text) : Subject {
    if (text == "#odia") { #odia } else if (text == "#maths") { #maths } else if (text == "#scienceAndSocial") { #scienceAndSocial } else if (text == "#english") { #english } else if (text == "#drawing") { #drawing } else { #odia };
  };

  func assessmentTypeFromText(text : Text) : AssessmentType {
    if (text == "#fa1") { #fa1 } else if (text == "#fa2") { #fa2 } else if (text == "#sa1") { #sa1 } else if (text == "#sa2") { #sa2 } else if (text == "#writtenWork1") { #writtenWork1 } else if (text == "#writtenWork2") { #writtenWork2 } else if (text == "#projectWork1") { #projectWork1 } else if (text == "#projectWork2") { #projectWork2 } else { #fa1 };
  };

  public query ({ caller }) func getRawMarks(studentId : Text) : async [MarkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view marks");
    };

    // Check if caller can access this student's data
    if (not canAccessStudentData(caller, studentId)) {
      Runtime.trap("Unauthorized: You can only view your own marks");
    };

    let results = List.empty<MarkEntry>();
    
    for ((key, marks) in persistentMarks.entries()) {
      let parts = key.split(#text "|");
      let partsArray = parts.toArray();
      
      if (partsArray.size() >= 3 and partsArray[0] == studentId) {
        let subject = subjectFromText(partsArray[1]);
        let assessmentType = assessmentTypeFromText(partsArray[2]);
        
        results.add({
          studentId = partsArray[0];
          subject;
          assessmentType;
          marks;
        });
      };
    };

    results.values().toArray();
  };

  func getFinalMarks(studentId : Text, subject : Subject, assessmentType : AssessmentType) : Nat {
    let key = studentId # "|" # debug_show (subject) # "|" # debug_show (assessmentType);
    switch (persistentMarks.get(key)) {
      case (?marks) { marks };
      case (null) { 0 };
    };
  };

  func calculateFinalMarks(studentId : Text, subject : Subject) : Nat {
    let fa1 = getFinalMarks(studentId, subject, #fa1);
    let fa2 = getFinalMarks(studentId, subject, #fa2);
    let sa1 = getFinalMarks(studentId, subject, #sa1);
    let sa2 = getFinalMarks(studentId, subject, #sa2);

    let writtenWork1 = getFinalMarks(studentId, subject, #writtenWork1);
    let writtenWork2 = getFinalMarks(studentId, subject, #writtenWork2);
    let projectWork1 = getFinalMarks(studentId, subject, #projectWork1);
    let projectWork2 = getFinalMarks(studentId, subject, #projectWork2);

    // Two-stage rounding as per requirements:
    // Stage 1: Combined FA1+FA2+SA1 weighted and rounded up
    let combinedTotal = fa1 + fa2 + sa1;
    let combinedFullMarks = FA_FULL_MARKS + FA_FULL_MARKS + SA_FULL_MARKS; // 25+25+50=100
    let combinedWeighted = roundUpDivision(combinedTotal * 40, combinedFullMarks);

    // Stage 2: SA2 weighted and rounded up
    let weightedSA2 = roundUpDivision(sa2 * 40, SA_FULL_MARKS);

    // Written work and project work (best of two attempts)
    let bestWrittenWork = if (writtenWork1 > writtenWork2) { writtenWork1 } else { writtenWork2 };
    let bestProjectWork = if (projectWork1 > projectWork2) { projectWork1 } else { projectWork2 };
    
    let weightedWrittenWork = calculateWeightedComponent(bestWrittenWork, WRITTEN_WORK_FULL_MARKS, 10);
    let weightedProjectWork = calculateWeightedComponent(bestProjectWork, PROJECT_WORK_FULL_MARKS, 10);

    let total = combinedWeighted + weightedSA2 + weightedWrittenWork + weightedProjectWork;
    total;
  };

  func roundUpDivision(numerator : Nat, denominator : Nat) : Nat {
    if (denominator == 0) {
      return 0;
    };
    let quotient = numerator / denominator;
    let remainder = numerator % denominator;
    if (remainder > 0) {
      quotient + 1;
    } else {
      quotient;
    };
  };

  func calculateWeightedComponent(marks : Nat, fullMarks : Nat, weightage : Nat) : Nat {
    if (fullMarks == 0) {
      return 0;
    };
    let weightedValue = (marks * weightage) / fullMarks;
    weightedValue;
  };

  public query ({ caller }) func getFinalSubjectResults(studentId : Text) : async [FinalSubjectResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view results");
    };

    // Check if caller can access this student's data
    if (not canAccessStudentData(caller, studentId)) {
      Runtime.trap("Unauthorized: You can only view your own results");
    };

    let subjectsArray = [#odia, #maths, #scienceAndSocial, #english, #drawing];
    subjectsArray.map<Subject, FinalSubjectResult>(
      func(subject) {
        let totalMarks = calculateFinalMarks(studentId, subject);
        {
          subject;
          totalMarks;
        };
      },
    );
  };

  public query ({ caller }) func getSessionReport() : async [FinalSessionResult] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view session reports");
    };

    let subjectsArray = [#odia, #maths, #scienceAndSocial, #english, #drawing];
    let allStudentIds = getAllStudentIds();

    allStudentIds.map<Text, FinalSessionResult>(
      func(studentId) {
        var totalMarks = 0;
        for (subject in subjectsArray.vals()) {
          totalMarks += calculateFinalMarks(studentId, subject);
        };

        let marksEntries = List.empty<MarkEntry>();
        for ((key, marks) in persistentMarks.entries()) {
          let parts = key.split(#text "|");
          let partsArray = parts.toArray();
          
          if (partsArray.size() >= 3 and partsArray[0] == studentId) {
            let subject = subjectFromText(partsArray[1]);
            let assessmentType = assessmentTypeFromText(partsArray[2]);
            
            marksEntries.add({
              studentId = partsArray[0];
              subject;
              assessmentType;
              marks;
            });
          };
        };

        {
          studentId;
          marksEntries = marksEntries.values().toArray();
          totalMarks;
        };
      },
    );
  };

  func getAllStudentIds() : [Text] {
    let studentIdsSet = Map.empty<Text, Bool>();
    
    for ((key, _) in persistentMarks.entries()) {
      let parts = key.split(#text "|");
      let partsArray = parts.toArray();
      if (partsArray.size() >= 1) {
        studentIdsSet.add(partsArray[0], true);
      };
    };

    let studentIdsList = List.empty<Text>();
    for ((studentId, _) in studentIdsSet.entries()) {
      studentIdsList.add(studentId);
    };
    
    studentIdsList.values().toArray();
  };
};
