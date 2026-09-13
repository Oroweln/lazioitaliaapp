// The server stores industry as free text and Discover filters with a case-insensitive exact
// match, so registration, company editing and the Discover chips must all use this one list.
export const INDUSTRIES = [
  'IT',
  'Manufacturing',
  'Energy',
  'Food & Wine',
  'Real Estate',
  'Logistics',
  'Finance',
  'Legal',
  'Consulting',
  'Marketing',
  'Design',
  'Healthcare',
  'Tourism',
  'Agriculture',
  'Other',
] as const;
