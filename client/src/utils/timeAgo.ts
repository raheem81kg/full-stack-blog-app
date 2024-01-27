import { formatDistanceToNow, parseISO } from "date-fns";

const timeAgo = (created_at: string): string => {
   try {
      return formatDistanceToNow(parseISO(created_at), { addSuffix: true });
   } catch (error) {
      console.error("Invalid date format:", error);
      return "Invalid date"; // Fallback message for invalid date
   }
};

export default timeAgo;
