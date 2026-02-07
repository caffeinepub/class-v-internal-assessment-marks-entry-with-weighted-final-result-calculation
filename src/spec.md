# Specification

## Summary
**Goal:** Improve the Class V Assessment System by making saved marks reliably persist, updating final-mark calculations to use two-stage rounding, adding a detailed Final Results Sheet, and showing a branded opening screen on app launch.

**Planned changes:**
- Backend: Fix marks persistence so each (studentId, subject, assessmentType) stores a single updatable value that survives refreshes and canister upgrades.
- Backend: Update final mark calculation to use two-stage rounding (ceiling) for the FA1+FA2+SA1 weighted component and the SA2 weighted component before computing final totals.
- Backend: Add/extend APIs and types to return a detailed per-student/per-subject breakdown including raw marks and corresponding weightage marks, subject totals, and student grand totals.
- Frontend: Implement a “Final Results Sheet” screen that renders the detailed breakdown for all students in a session (raw marks, weightage marks, subject totals, grand total).
- Frontend: Add an opening splash/landing view that initially displays exactly “Class V Assessment System By Ratnakara Ranbida” and then transitions into the normal app flow.
- Frontend: Update any calculation/explanatory text to match the implemented two-stage rounding behavior and current weightage rules.

**User-visible outcome:** Marks entered and saved remain available after refresh and upgrades; final totals are whole numbers computed with the requested two-stage rounding; users can view a detailed Final Results Sheet showing raw and weightage marks plus totals; and the app opens with the specified branded opening message before proceeding.
