import { cn } from "@/lib/utils";
import "./styles.css";

type DoorProps = {
  content: Door;
  onClick: (index: number) => void;
  selected?: boolean;
  open?: boolean;
};
const Door = ({ content, onClick, open, selected }: DoorProps) => {
  return (
    <div
      className={cn("doorBg", selected && "doorReveal")}
      onClick={() => {
        onClick(content.index);
      }}
    >
      <div
        className={cn("door", open && "doorOpen")}
      ></div>
      {open && content.content}
    </div>
  );
};

export default Door;
