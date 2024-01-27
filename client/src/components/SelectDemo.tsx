import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectDemoProps {
   selectValue: string;
   setSelectValue: (value: string) => void;
}

const SelectDemo: React.FC<SelectDemoProps> = ({ selectValue, setSelectValue }) => {
   return (
      <Select value={selectValue} onValueChange={setSelectValue}>
         <SelectTrigger className="w-[180px] mb-2 ml-auto border-1 border-black border-solid">
            <SelectValue placeholder="All Blogs" />
         </SelectTrigger>
         <SelectContent>
            <SelectGroup>
               <SelectLabel>Feed</SelectLabel>
               <SelectItem value="all_blogs">All Blogs</SelectItem>
               <SelectItem value="following">Following</SelectItem>
            </SelectGroup>
         </SelectContent>
      </Select>
   );
};

export default SelectDemo;
