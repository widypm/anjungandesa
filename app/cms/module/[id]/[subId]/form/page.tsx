"use client";
import { useParams } from "next/navigation";
import { FormWPM } from "../../../../../components/cms/ui/Form";
export default function ModuleList() {
  const params = useParams();
  const id = params.id; // nilai dari [id]
  const safeId = Array.isArray(id) ? id[0] : id;
  const folder = params.subId; // nilai dari [id]
  const safefolder = Array.isArray(folder) ? folder[0] : folder;

  return (
    <div className="">
      <FormWPM moduleName={safeId} folder={safefolder} />
    </div>
  );
}
