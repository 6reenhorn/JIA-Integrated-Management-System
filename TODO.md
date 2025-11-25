# Update PayrollRecords Filters to Match Attendance Filters

## Tasks
- [ ] Update PayrollFilters.tsx to include Preset and Custom tabs
- [ ] In Preset tab, add status dropdown (All Status, Paid, Pending, Overdue)
- [ ] In Custom tab, add two datepickers for start and end date range
- [ ] Update PayrollRecords.tsx to use new filter props and state
- [ ] Modify filtering logic to filter by status and paymentDate range
- [ ] Test the updated filters

## Details
- Preset tab: Status dropdown applies filter immediately
- Custom tab: Two datepickers with Apply button for date range on paymentDate
- Change from month/year/status to status and date range filtering
