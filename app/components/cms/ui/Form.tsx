"use client";

import React, { useState, useEffect } from "react";
import InputField from "./InputField";
import ButtonUi from "./ButtonUi";
import { FiArrowLeft, FiArrowRight, FiCheck, FiDisc } from "react-icons/fi";
import { Field, Step } from "../../../types";
import { useSearchParams, useRouter } from "next/navigation"; // jika id dari query
import { cleanContent, FetchData, GetEncrypt } from "../../../lib/helper";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { usePageTitle } from "../../../lib/PageTitelCmsContext";
import { BlobOptions } from "buffer";
import { wordingTr } from "app/lib/translationWording";
export const runtime = "node";
type Props = {
  moduleName: string;
  folder: string;
};
export const FormWPM: React.FC<Props> = ({ moduleName, folder }) => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "0";
  const user = useDecryptedLoginState();
  const [langs, setLangs] = useState<{ name: string; data: Step[] }[]>([]);
  const [isPoint, setIspoint] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("id");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<
    { lang: string; value: { [key: string]: any } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { setTitle } = usePageTitle();
  const router = useRouter();

  const handleChange = (
    name: string,
    value: any,
    all?: boolean,
    notCopy?: boolean
  ) => {
    const currentField = currentFields.find((f) => f.name === name); // Field asal
    // Transform value utama
    if (currentField?.replaceValue && typeof value === "string") {
      const { from, to } = currentField.replaceValue;
      value = value.split(from).join(to);
    }

    setFormData((prev) =>
      prev.map((item) => {
        const shouldUpdate = all
          ? notCopy
            ? item.lang === currentLang
            : true
          : item.lang === currentLang;

        if (!shouldUpdate) return item;

        const updatedValue: Record<string, any> = {
          ...item.value,
          [name]: value,
        };

        // Proses sameValue
        if (currentField?.sameValue?.length > 0) {
          for (const sameFieldName of currentField.sameValue) {
            const targetField = currentFields.find(
              (f) => f.name === sameFieldName
            );

            let copiedValue = value;

            // Gunakan replaceValue milik field tujuan
            if (targetField?.replaceValue && typeof copiedValue === "string") {
              const { from, to } = targetField.replaceValue;
              copiedValue = copiedValue.split(from).join(to);
            }

            updatedValue[sameFieldName] = copiedValue;
          }
        }

        return {
          ...item,
          value: updatedValue,
        };
      })
    );
  };

  const currentSteps = langs.find((l) => l.name === currentLang)?.data ?? [];
  const currentFields = currentSteps[currentStep]?.fields ?? [];
  const handleSubmit = async () => {
    try {
      const cleanFormData: { [key: string]: any } = { ...formData };
      // Cek semua field string (terutama yang pakai TinyMCE)
      for (const key in cleanFormData) {
        const value = cleanFormData[key];
        if (typeof value === "string") {
          cleanFormData[key] = cleanContent(value);
        }
      }
      const aesraw = GetEncrypt(JSON.stringify(cleanFormData));
      const methodFetch = id == "0" ? "POST" : "PUT";
      const dataapi = await FetchData(
        `api/${folder}/${moduleName}/form/${id}`,
        methodFetch,
        aesraw,
        true,
        user?.data?.token,
        true
      );
      if (dataapi.code == "200") {
        // router.push("/cms/module/" + moduleName + "/list");
        router.back();
      }
    } catch (error) {}
    // console.log("Data terkirim:\n" + JSON.stringify(formData, null, 2));
  };
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);

      try {
        const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
        const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
        const dataapi = await FetchData(
          `api/${folder}/${moduleName}/form/${id}${rawQs}`,
          "GET",
          "",
          false,
          user?.data?.token
        );
        setTitle(dataapi?.data?.title);
        const stepsLangs = dataapi?.data?.data ?? [];
        setLangs(stepsLangs);
        // console.log("dataapi", dataapi);
        // Ubah ke bentuk array: { lang, value }
        const initialFormData = stepsLangs.map((langObj: any) => {
          const langForm: any = {};
          for (const step of langObj.data) {
            for (const field of step.fields) {
              langForm[field.name] = field.value ?? "";
            }
          }
          return { lang: langObj.name, value: langForm };
        });
        setIspoint(dataapi?.data?.isPoint);
        setFormData(initialFormData);
        setCurrentLang(stepsLangs[0]?.name || "id");
      } catch (err) {
        console.error("Failed to fetch form:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, [id]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-600">Loading form...</div>
        </div>
      </div>
    );
  }
  const isFieldHidden = (field: any, formValues: any) => {
    if (!field.hideFields) return false;

    return field.hideFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object"
            ? formValues[n]?.value
            : formValues[n]
        )
      );
    });
  };
  const isFieldDisabled = (field: any, formValues: any) => {
    if (!field.disableFields) return false;

    return field.disableFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object" ? formValues[n].value : formValues[n]
        )
      );
    });
  };

  return (
    <div className="w-full  mx-auto  space-y-10">
      {/* Language Tabs */}
      {langs.length > 1 && (
        <div className="flex space-x-2 ">
          {langs.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setCurrentLang(lang.name)}
              className={`px-4 py-1 uppercase rounded-md border text-sm font-medium transition
                ${
                  currentLang === lang.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
      {/* Step Indicator */}
      {currentSteps?.length > 1 && (
        <React.Fragment>
          <div className="relative flex flex-col items-center bg-white p-2 rounded-md shadow-lg !mt-2">
            <div className="relative w-full max-w-[700px]">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-blue-600 z-10 transition-all duration-300"
                style={{
                  width: `${
                    currentStep === 0
                      ? "0%"
                      : `${(currentStep / (currentSteps.length - 1)) * 100}%`
                  }`,
                }}
              />
              <div className="flex justify-between relative z-20">
                {currentSteps.map((step, index) => (
                  <div
                    key={index}
                    className={
                      (index == currentSteps.length - 1
                        ? "items-end "
                        : index == 0
                        ? " items-start "
                        : " items-center ") + "flex flex-col  w-20"
                    }
                  >
                    <div
                      onClick={() => setCurrentStep(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer border-2 transition
                    ${
                      index <= currentStep
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-600"
                    }`}
                    >
                      {isPoint ? <FiDisc /> : index + 1}
                    </div>
                    <div className="text-xs mt-1 text-center">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </React.Fragment>
      )}

      {/* Form Content */}
      <div
        className={
          "bg-white shadow rounded-xl p-4 !mb-10" +
          (currentSteps?.length > 1 ? " !mt-2" : " !mt-4")
        }
      >
        <form className="grid md:grid-cols-12 gap-2">
          {currentFields?.map((field, index) => {
            const fieldValue =
              formData.find((item) => item.lang === currentLang)?.value ?? {};

            const hidden = isFieldHidden(field, fieldValue);
            const disabled = isFieldDisabled(field, fieldValue);

            if (hidden) return null;

            return (
              <React.Fragment key={index + "frm-" + field.name}>
                {field.type != "hide" && (
                  <div
                    className={(field?.cols ?? "col-span-6") + " "}
                    key={index + "-" + field.name}
                  >
                    <InputField
                      name={field.name}
                      label={field.label}
                      type={field.type}
                      value={
                        formData.find((item) => item.lang === currentLang)
                          ?.value[field.name] ?? ""
                      }
                      onChange={(name: string, val: any, notCopy: boolean) =>
                        handleChange(name, val, field.allLang ?? false, notCopy)
                      }
                      fieldAddRow={field.fieldAddRow}
                      uriSelect={field.uriSelect}
                      disabled={field.disabled ?? false}
                      formValues={formData}
                      trigerValue={field.trigerValue}
                      info={field?.info}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </form>
      </div>
      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg z-10">
        <div className="flex justify-end gap-4 ">
          {currentStep > 0 ? (
            <ButtonUi
              variant="secondary"
              onClick={async () => setCurrentStep((s) => s - 1)}
              icon={<FiArrowLeft />}
            >
              Prev
            </ButtonUi>
          ) : (
            <ButtonUi
              variant="secondary"
              onClick={async () => {
                router.push(`/cms/module/${moduleName}/${folder}/list`);
              }}
              icon={<FiArrowLeft />}
            >
              {wordingTr(user?.data?.langCode, "back")}
            </ButtonUi>
          )}
          {currentStep < currentSteps.length - 1 ? (
            <ButtonUi
              onClick={async () => setCurrentStep((s) => s + 1)}
              icon={<FiArrowRight />}
            >
              {wordingTr(user?.data?.langCode, "next")}
            </ButtonUi>
          ) : (
            <ButtonUi onClick={handleSubmit} icon={<FiCheck />}>
              {wordingTr(user?.data?.langCode, "save")}
            </ButtonUi>
          )}
        </div>
      </div>
    </div>
  );
};
