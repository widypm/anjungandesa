import { useSelector } from "react-redux";
import { GetDecrypt } from "./helper";

export function useDecryptedLoginState<T = any>(): T | null {
  const loginstate = useSelector((state: any) => state?.value);
  if (typeof loginstate === "string") {
    try {
      const decrypted = GetDecrypt(loginstate);
      return JSON.parse(decrypted ?? "{}") as T;
    } catch (err) {
      console.error("Failed to parse decrypted login state:", err);
    }
  }
  return null;
}
