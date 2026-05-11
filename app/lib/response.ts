import { GetEncrypt } from "./helper";

export function ResponseHttp(
  code: number,
  msg: string,
  data: any = {},
  error?: any
) {
  if (code != 200) {
    let respon = GetEncrypt(
      JSON.stringify({
        code: code,
        message: msg,
      })
    );
    if (code == 500) {
      respon = GetEncrypt(
        JSON.stringify({
          code: code,
          message: "Maintenace server Apps.",
          errorsvr: error,
        })
      );
    }
    return respon;
  } else {
    const respon = GetEncrypt(
      JSON.stringify({
        code: code,
        message: msg,
        data: data,
      })
    );
    return respon;
  }
}
export function ResponseInit(data: any = {}) {
  const respon = GetEncrypt(
    JSON.stringify({
      code: 200,
      message: "Data successfully",
      ...data,
    })
  );
  return respon;
}
