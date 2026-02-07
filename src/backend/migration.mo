import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  // Types matching old state
  type Subject = {
    #odia;
    #maths;
    #scienceAndSocial;
    #english;
    #drawing;
  };

  type AssessmentType = {
    #fa1;
    #fa2;
    #sa1;
    #sa2;
    #writtenWork1;
    #writtenWork2;
    #projectWork1;
    #projectWork2;
  };

  type MarkEntry = {
    studentId : Text;
    subject : Subject;
    assessmentType : AssessmentType;
    marks : Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; studentId : ?Text }>;
    marks : List.List<MarkEntry>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; studentId : ?Text }>;
    persistentMarks : Map.Map<Text, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    let persistentMarks = Map.empty<Text, Nat>();

    for (mark in old.marks.values()) {
      let key = mark.studentId # "|" # debug_show (mark.subject) # "|" # debug_show (mark.assessmentType);
      persistentMarks.add(key, mark.marks);
    };

    {
      userProfiles = old.userProfiles;
      persistentMarks;
    };
  };
};
