import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useParams } from "react-router-dom"
import type { Template } from "@/types/template"
import templatesData from "@/db/db.json"
import { Label } from "@radix-ui/react-label"
import { Trash } from "lucide-react"

export default function TemplatesPage() {
  const { id } = useParams();

  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    setTemplates(templatesData)
  }, [])

  const template = templates.find(t => String(t.id) === id);

  const [fields, setFields] = useState<Template['fields']>([])

  useEffect(() => {
    setFields(template ? template.fields : [])
  }, [template])

  // const fields = template ? template.fields : [];

  console.log('Template:', template);
  console.log('Fields:', fields);

  const addField = () => {
    setFields(prev => [
      ...prev,
      { id: (prev.length || 0) + 1, label: ``, type: "text" }
    ])
  }

  const save = async () => {
    if (!template) return;

    const updatedTemplate = { ...template, fields };

    try {
      const res = await fetch(`http://localhost:4000/templates/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTemplate),
      });

      if (!res.ok) throw new Error("Failed to save template");
      alert("Template saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving template.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">FireForm</h1>

      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl font-bold">Template ID: {id}</h2>

        <div className="grid grid-cols-2 gap-4">
          <Label htmlFor="template-name" className="font-medium">Template Name</Label>
          <Label htmlFor="upload-document" className="font-medium">Upload Document</Label>
          <Input id="template-name" value={template?.name} />
          <Input id="upload-document" placeholder="upload document" type="file" />
        </div>
        <hr className="w-full my-4 border-gray-200 border-0.5" />
        <p>Inputs in the template will be:</p>

        {fields.map((field) => (
          <div key={field.id} className="flex gap-5">
            <Input value={field.label} onChange={(e) => {
              const newLabel = e.target.value;
              setFields(prev => prev.map(f => f.id === field.id ? { ...f, label: newLabel } : f));
            }} />
            <Button
              variant="outline"
              className="ml-2 text-red-600"
              onClick={() =>
                setTemplates(prev =>
                  prev.map(t =>
                    String(t.id) === id
                      ? { ...t, fields: t.fields.filter(f => f.id !== field.id) }
                      : t
                  )
                )
              }
            >
              <Trash className="size-3.5" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="bg-orange-100 text-orange-700 hover:bg-orange-200"
          onClick={addField}
        >
          Add more
        </Button>

        <div className="flex justify-end gap-5">
          <Link to="/dashboard/form-templates">
            <Button variant="outline" className="text-gray-700">
              Go Back
            </Button>
          </Link>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white" onClick={save}>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  )
}