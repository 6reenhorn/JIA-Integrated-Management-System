# TODO: Improve Employee Table Pagination

## Tasks
- [x] Modify getVisiblePages logic in EmployeeActions.tsx to show at most 4 page numbers with fixed display (1 2 3 4, then 1 ... 3 4, etc.)
- [x] Add "First" button to jump to page 1
- [x] Add "Last" button to jump to the last page
- [x] Ensure buttons are disabled appropriately (First when on page 1, Last when on last page)

## Notes
- Changed to maxVisible = 4 with fixed pagination that doesn't move the buttons.
- Add First and Last buttons before Previous and after Next respectively.
