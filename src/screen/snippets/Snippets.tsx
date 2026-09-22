import React from "react";
import { __ } from "@wordpress/i18n";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./../../components/common/Logo";
import SnippetTable from "./components/SnippetTable";
import SnippetStats from "./components/SnippetStats";

const Snippets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Logo />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {__("SnippetCrate", "snippetcrate")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {__(
                "Manage the PHP, JavaScript, CSS and HTML snippets running on your site.",
                "snippetcrate"
              )}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/snippet/add")}>
          <Plus />
          {__("Add New Snippet", "snippetcrate")}
        </Button>
      </div>

      <SnippetStats />
      <SnippetTable />
    </div>
  );
};

export default Snippets;
