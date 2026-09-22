import React from "react";
import { __ } from "@wordpress/i18n";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./../../components/common/Logo";
import AddNewForm from "./components/AddNewForm";

const AddNew: React.FC = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id?: string }>();
  const editProps = id ? { id: id } : {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Logo />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {id
                ? __("Edit Snippet", "snippetcrate")
                : __("Add New Snippet", "snippetcrate")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {id
                ? __("Update this snippet and its settings.", "snippetcrate")
                : __(
                    "Create a new PHP, JavaScript, CSS or HTML snippet for your site.",
                    "snippetcrate"
                  )}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft />
          {__("Back to snippets", "snippetcrate")}
        </Button>
      </div>
      <AddNewForm {...editProps} />
    </div>
  );
};

export default AddNew;
