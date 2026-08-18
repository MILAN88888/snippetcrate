import React from "react";
import { Code2 } from "lucide-react";

const Logo: React.FC = () => (
  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
    <Code2 className="size-6" strokeWidth={2.5} />
  </div>
);

export default Logo;
