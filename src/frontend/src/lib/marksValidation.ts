export function validateMarks(value: string, fullMarks: number): string | null {
  if (value.trim() === '') {
    return null; // Empty is allowed (not entered yet)
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return 'Please enter a valid number';
  }

  if (num < 0) {
    return 'Marks cannot be negative';
  }

  if (num > fullMarks) {
    return `Marks cannot exceed ${fullMarks}`;
  }

  if (!Number.isInteger(num)) {
    return 'Please enter a whole number';
  }

  return null;
}
