# Employee Add Functionality Modification TODO

## Tasks
- [ ] Update Employees.tsx: Add form field states, isAdding state, modify handleAddEmployee, pass props to modal and table, add resetForm function
- [ ] Update AddStaffModal.tsx: Convert to controlled component with props for fields and callbacks
- [ ] Update EmployeeTable.tsx: Add isAdding prop and conditional green background to thead

## Followup Steps
- [ ] Test the flow: Open modal, fill form, click add -> modal closes immediately, header turns green, data adds in background, form resets for next open
- [ ] Ensure form validation still works
- [ ] Handle any errors in API call (console.error for now)
