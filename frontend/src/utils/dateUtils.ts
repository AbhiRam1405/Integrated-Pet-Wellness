/**
 * Formats a time string or ISO date string into a 12-hour format with AM/PM.
 * Examples: 
 *   "13:45:00" -> "01:45 PM"
 *   "09:05" -> "09:05 AM"
 *   "2026-03-16T21:13:47" -> "09:13 PM"
 */
export const formatTime12h = (timeInput: string | undefined | null): string => {
    if (!timeInput) return '';
    
    let hours: number;
    let minutes: string;

    // Check if it's an ISO string (contains T)
    if (timeInput.includes('T')) {
        const date = new Date(timeInput);
        if (isNaN(date.getTime())) return timeInput;
        hours = date.getHours();
        minutes = date.getMinutes().toString().padStart(2, '0');
    } else {
        // Assume HH:mm:ss or HH:mm
        const parts = timeInput.split(':');
        if (parts.length < 2) return timeInput;
        hours = parseInt(parts[0], 10);
        minutes = parts[1].padStart(2, '0');
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const strHours = h12 < 10 ? `0${h12}` : h12;
    
    return `${strHours}:${minutes} ${ampm}`;
};
