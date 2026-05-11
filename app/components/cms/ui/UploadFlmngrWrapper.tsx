"use client";
import dynamic from "next/dynamic";

const UploadFlmngrWrapper = dynamic(() => import("./uploadFileManager"), {
  ssr: false,
});

export default UploadFlmngrWrapper;
