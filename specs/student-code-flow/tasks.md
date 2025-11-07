# Student Code Flow Implementation Tasks

## Overview
Implement a student-centric flow where students can directly access their assigned classes using a unique student code. Teachers will add students to classes using these codes, and students will use the codes during registration to automatically be connected to their assigned classes.

## Task Phases

### Phase 1: Setup & Database Changes
- [ ] **T1.1** - Add `studentCode` field to User entity (backend)
- [ ] **T1.2** - Create database migration for studentCode field
- [ ] **T1.3** - Add unique constraint on studentCode field
- [ ] **T1.4** - Update auth service to handle studentCode during registration

### Phase 2: Backend API Updates
- [ ] **T2.1** - Update registration endpoint to accept studentCode
- [ ] **T2.2** - Add validation for studentCode format (e.g., 8-character alphanumeric)
- [ ] **T2.3** - Create student code generator service
- [ ] **T2.4** - Add endpoint to verify student code availability
- [ ] **T2.5** - Update student enrollment to use studentCode instead of manual selection

### Phase 3: Teacher Interface Updates
- [ ] **T3.1** - Add student code field to "Add Student" form in ClassDetailsScreen
- [ ] **T3.2** - Update student creation API call to include studentCode
- [ ] **T3.3** - Display student codes in the students list
- [ ] **T3.4** - Add student code generator in teacher interface
- [ ] **T3.5** - Add student code search/filter functionality

### Phase 4: Student Registration Flow
- [ ] **T4.1** - Update mobile registration form to include studentCode field
- [ ] **T4.2** - Add studentCode validation on frontend
- [ ] **T4.3** - Update API client to send studentCode during registration
- [ ] **T4.4** - Add error handling for invalid student codes

### Phase 5: Student Dashboard Updates
- [ ] **T5.1** - Create student dashboard that shows assigned classes
- [ ] **T5.2** - Auto-redirect students to their class list after login
- [ ] **T5.3** - Add "My Classes" screen for students
- [ ] **T5.4** - Update navigation to hide teacher-only features for students

### Phase 6: Testing & Validation
- [ ] **T6.1** - Add unit tests for studentCode validation
- [ ] **T6.2** - Add integration tests for registration with studentCode
- [ ] **T6.3** - Test teacher adding students with codes
- [ ] **T6.4** - Test student registration and class assignment
- [ ] **T6.5** - Update test scripts with studentCode scenarios

### Phase 7: Documentation & Polish
- [ ] **T7.1** - Update API documentation with studentCode endpoints
- [ ] **T7.2** - Create user guide for teachers on student code system
- [ ] **T7.3** - Create user guide for students on registration process
- [ ] **T7.4** - Add error messages and user feedback improvements

## Dependencies
- T1.2 depends on T1.1 (migration needs entity changes)
- T1.3 depends on T1.2 (constraint needs migration)
- T2.x depends on T1.x (API needs database changes)
- T3.x depends on T2.x (UI needs API endpoints)
- T4.x depends on T2.x (registration needs backend support)
- T5.x depends on T4.x (dashboard needs registration flow)
- T6.x depends on all previous phases
- T7.x depends on T6.x (documentation needs working system)

## Execution Order
1. Complete Phase 1 (Database) sequentially
2. Complete Phase 2 (Backend) sequentially  
3. Complete Phase 3 & 4 in parallel [P] (Teacher UI & Student Registration)
4. Complete Phase 5 (Student Dashboard) after Phase 4
5. Complete Phase 6 (Testing) after all implementation phases
6. Complete Phase 7 (Documentation) last

## Success Criteria
- Students can register with a student code and be automatically assigned to classes
- Teachers can add students using student codes
- Student codes are unique and properly validated
- Students see only their assigned classes after login
- System maintains security and role-based access control
- All existing functionality continues to work