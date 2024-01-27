import style from "../scss/NotFound.module.scss";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
   return (
      <div className={style.Container}>
         <AlertTriangle size={64} color="#6cc2b6" />
         <p>My apologies, maybe try searching for something else...</p>
      </div>
   );
};

export default NotFound;
