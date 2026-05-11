"use client";
import TableWPM from "../../../../../components/cms/ui/Table";
import { useParams } from "next/navigation";
export default function ModuleList() {
  const params = useParams();
  const id = params.id; // nilai dari [id]
  const safeId = Array.isArray(id) ? id[0] : id;
  const folder = params.subId; // nilai dari [id]
  const safefolder = Array.isArray(folder) ? folder[0] : folder;

  return (
    <div className="p-4 bg-white rounded-md">
      <TableWPM moduleName={safeId} folder={safefolder} />
    </div>
  );
}
