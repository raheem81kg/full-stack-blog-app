import { toast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

const useToastError = () => {
   function toastError(error: unknown, Title = "Error!", isIgnore401Error: boolean = true) {
      if (isIgnore401Error) return;
      if (error instanceof AxiosError || (error instanceof AxiosError && error?.response?.data?.error)) {
         toast({
            title: Title,
            description: error.response?.data.error,
         });
         return;
      }

      if (error instanceof AxiosError || (error instanceof AxiosError && error.message)) {
         toast({
            title: Title,
            description: error.message,
         });
         return;
      }

      toast({
         title: "Error!",
         description: String(error),
      });
   }
   return toastError;
};

export default useToastError;
